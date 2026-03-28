"""SQLite-backed persistent storage for token usage and cost data.

Uses a single file ``{data_dir}/costs.db`` that survives server restarts.
All public helpers are safe to call from multiple threads (sqlite3 in
*serialized* mode with a short busy-timeout).
"""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from clawteam.team.models import get_data_dir

_DB_FILENAME = "costs.db"
_local = threading.local()


def _db_path() -> Path:
    return get_data_dir() / _DB_FILENAME


def _get_conn() -> sqlite3.Connection:
    conn = getattr(_local, "conn", None)
    if conn is not None:
        return conn
    conn = sqlite3.connect(str(_db_path()), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    _local.conn = conn
    _ensure_tables(conn)
    return conn


def _ensure_tables(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS cost_events (
            id            TEXT PRIMARY KEY,
            team_name     TEXT NOT NULL,
            agent_name    TEXT NOT NULL DEFAULT '',
            provider      TEXT NOT NULL DEFAULT '',
            model         TEXT NOT NULL DEFAULT '',
            input_tokens  INTEGER NOT NULL DEFAULT 0,
            output_tokens INTEGER NOT NULL DEFAULT 0,
            cost_cents    REAL    NOT NULL DEFAULT 0.0,
            reported_at   TEXT    NOT NULL,
            synced_at     TEXT    NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_ce_team      ON cost_events(team_name);
        CREATE INDEX IF NOT EXISTS idx_ce_agent     ON cost_events(team_name, agent_name);
        CREATE INDEX IF NOT EXISTS idx_ce_model     ON cost_events(team_name, model);
        CREATE INDEX IF NOT EXISTS idx_ce_reported  ON cost_events(reported_at);
    """)


# ------------------------------------------------------------------
# Write
# ------------------------------------------------------------------

def record_event(
    team_name: str,
    event_id: str,
    agent_name: str = "",
    provider: str = "",
    model: str = "",
    input_tokens: int = 0,
    output_tokens: int = 0,
    cost_cents: float = 0.0,
    reported_at: str = "",
) -> None:
    if not reported_at:
        reported_at = datetime.now(timezone.utc).isoformat()
    synced_at = datetime.now(timezone.utc).isoformat()
    conn = _get_conn()
    conn.execute(
        """INSERT OR REPLACE INTO cost_events
           (id, team_name, agent_name, provider, model,
            input_tokens, output_tokens, cost_cents, reported_at, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (event_id, team_name, agent_name, provider, model,
         input_tokens, output_tokens, cost_cents, reported_at, synced_at),
    )
    conn.commit()


# ------------------------------------------------------------------
# Sync: import existing JSON cost files into SQLite
# ------------------------------------------------------------------

def sync_from_json(team_name: str) -> int:
    """Import cost-*.json files for *team_name* into SQLite.

    Returns the number of **newly** imported events.
    """
    from clawteam.team.costs import _costs_root, _read_event_file

    root = _costs_root(team_name)
    conn = _get_conn()
    existing: set[str] = {
        row[0]
        for row in conn.execute(
            "SELECT id FROM cost_events WHERE team_name = ?", (team_name,)
        ).fetchall()
    }
    imported = 0
    for path in sorted(root.glob("cost-*.json")):
        event = _read_event_file(path)
        if event is None or event.id in existing:
            continue
        record_event(
            team_name=team_name,
            event_id=event.id,
            agent_name=event.agent_name,
            provider=event.provider,
            model=event.model,
            input_tokens=event.input_tokens,
            output_tokens=event.output_tokens,
            cost_cents=event.cost_cents,
            reported_at=event.reported_at,
        )
        imported += 1
    return imported


def sync_all_teams() -> dict[str, int]:
    """Discover all teams and sync their JSON cost files."""
    results: dict[str, int] = {}
    try:
        from clawteam.team.manager import TeamManager
        for meta in TeamManager.discover_teams():
            name = meta["name"]
            results[name] = sync_from_json(name)
    except Exception:
        pass
    return results


# ------------------------------------------------------------------
# Read helpers
# ------------------------------------------------------------------

def _rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(r) for r in rows]


def get_summary(team_name: str | None = None) -> dict[str, Any]:
    conn = _get_conn()
    if team_name:
        row = conn.execute(
            """SELECT
                 COUNT(*)        AS event_count,
                 COALESCE(SUM(input_tokens), 0)  AS total_input,
                 COALESCE(SUM(output_tokens), 0) AS total_output,
                 COALESCE(SUM(cost_cents), 0)     AS total_cost_cents
               FROM cost_events WHERE team_name = ?""",
            (team_name,),
        ).fetchone()
    else:
        row = conn.execute(
            """SELECT
                 COUNT(*)        AS event_count,
                 COALESCE(SUM(input_tokens), 0)  AS total_input,
                 COALESCE(SUM(output_tokens), 0) AS total_output,
                 COALESCE(SUM(cost_cents), 0)     AS total_cost_cents
               FROM cost_events"""
        ).fetchone()
    return {
        "eventCount": row["event_count"],
        "totalInputTokens": row["total_input"],
        "totalOutputTokens": row["total_output"],
        "totalCostCents": round(row["total_cost_cents"], 4),
        "totalCostDollars": round(row["total_cost_cents"] / 100, 4),
    }


def get_by_agent(team_name: str | None = None) -> list[dict[str, Any]]:
    conn = _get_conn()
    if team_name:
        rows = conn.execute(
            """SELECT agent_name,
                      COUNT(*) AS events,
                      SUM(input_tokens) AS input_tokens,
                      SUM(output_tokens) AS output_tokens,
                      SUM(cost_cents) AS cost_cents
               FROM cost_events WHERE team_name = ?
               GROUP BY agent_name ORDER BY cost_cents DESC""",
            (team_name,),
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT agent_name,
                      COUNT(*) AS events,
                      SUM(input_tokens) AS input_tokens,
                      SUM(output_tokens) AS output_tokens,
                      SUM(cost_cents) AS cost_cents
               FROM cost_events
               GROUP BY agent_name ORDER BY cost_cents DESC"""
        ).fetchall()
    return [
        {
            "agentName": r["agent_name"],
            "events": r["events"],
            "inputTokens": r["input_tokens"],
            "outputTokens": r["output_tokens"],
            "costCents": round(r["cost_cents"], 4),
        }
        for r in rows
    ]


def get_by_model(team_name: str | None = None) -> list[dict[str, Any]]:
    conn = _get_conn()
    if team_name:
        rows = conn.execute(
            """SELECT model, provider,
                      COUNT(*) AS events,
                      SUM(input_tokens) AS input_tokens,
                      SUM(output_tokens) AS output_tokens,
                      SUM(cost_cents) AS cost_cents
               FROM cost_events WHERE team_name = ?
               GROUP BY model, provider ORDER BY cost_cents DESC""",
            (team_name,),
        ).fetchall()
    else:
        rows = conn.execute(
            """SELECT model, provider,
                      COUNT(*) AS events,
                      SUM(input_tokens) AS input_tokens,
                      SUM(output_tokens) AS output_tokens,
                      SUM(cost_cents) AS cost_cents
               FROM cost_events
               GROUP BY model, provider ORDER BY cost_cents DESC"""
        ).fetchall()
    return [
        {
            "model": r["model"] or "(unknown)",
            "provider": r["provider"] or "(unknown)",
            "events": r["events"],
            "inputTokens": r["input_tokens"],
            "outputTokens": r["output_tokens"],
            "costCents": round(r["cost_cents"], 4),
        }
        for r in rows
    ]


def get_by_team() -> list[dict[str, Any]]:
    conn = _get_conn()
    rows = conn.execute(
        """SELECT team_name,
                  COUNT(*) AS events,
                  SUM(input_tokens) AS input_tokens,
                  SUM(output_tokens) AS output_tokens,
                  SUM(cost_cents) AS cost_cents
           FROM cost_events
           GROUP BY team_name ORDER BY cost_cents DESC"""
    ).fetchall()
    return [
        {
            "teamName": r["team_name"],
            "events": r["events"],
            "inputTokens": r["input_tokens"],
            "outputTokens": r["output_tokens"],
            "costCents": round(r["cost_cents"], 4),
        }
        for r in rows
    ]


def get_timeline(team_name: str | None = None, granularity: str = "hour") -> list[dict[str, Any]]:
    """Aggregate cost data over time buckets.

    *granularity*: ``"hour"`` | ``"day"``
    """
    if granularity == "day":
        fmt = "%Y-%m-%d"
        trunc = "substr(reported_at, 1, 10)"
    else:
        fmt = "%Y-%m-%dT%H"
        trunc = "substr(reported_at, 1, 13)"

    conn = _get_conn()
    if team_name:
        rows = conn.execute(
            f"""SELECT {trunc} AS bucket,
                       SUM(input_tokens) AS input_tokens,
                       SUM(output_tokens) AS output_tokens,
                       SUM(cost_cents) AS cost_cents,
                       COUNT(*) AS events
                FROM cost_events WHERE team_name = ?
                GROUP BY bucket ORDER BY bucket""",
            (team_name,),
        ).fetchall()
    else:
        rows = conn.execute(
            f"""SELECT {trunc} AS bucket,
                       SUM(input_tokens) AS input_tokens,
                       SUM(output_tokens) AS output_tokens,
                       SUM(cost_cents) AS cost_cents,
                       COUNT(*) AS events
                FROM cost_events
                GROUP BY bucket ORDER BY bucket"""
        ).fetchall()
    return [
        {
            "time": r["bucket"],
            "inputTokens": r["input_tokens"],
            "outputTokens": r["output_tokens"],
            "costCents": round(r["cost_cents"], 4),
            "events": r["events"],
        }
        for r in rows
    ]


def get_recent_events(team_name: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    conn = _get_conn()
    if team_name:
        rows = conn.execute(
            """SELECT * FROM cost_events WHERE team_name = ?
               ORDER BY reported_at DESC LIMIT ?""",
            (team_name, limit),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM cost_events ORDER BY reported_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "teamName": r["team_name"],
            "agentName": r["agent_name"],
            "provider": r["provider"],
            "model": r["model"],
            "inputTokens": r["input_tokens"],
            "outputTokens": r["output_tokens"],
            "costCents": round(r["cost_cents"], 4),
            "reportedAt": r["reported_at"],
        }
        for r in rows
    ]
