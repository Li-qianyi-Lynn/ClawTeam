# ClawTeam — LLM Multi-Agent Swarm Coordination Framework

> Framework-agnostic CLI toolkit that enables LLM-based AI agents to self-organize into collaborative swarms, autonomously decompose tasks, communicate in real-time, and converge on solutions — without human orchestration code.

[![Python](https://img.shields.io/badge/Python-≥3.10-3776AB?logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/HKUDS/ClawTeam/actions)
[![PyPI](https://img.shields.io/badge/PyPI-clawteam-blue?logo=pypi&logoColor=white)](https://pypi.org/project/clawteam/)

## Highlights

- **Agent-Native Design** — 不是给人写编排代码的框架，而是 **AI Agent 自己调用 CLI 命令** 来组建团队、分派任务、协调通信
- **Persona-Driven Agent Teams** — 猫猫天团：6 个角色化 LLM Agent 通过精细 Prompt Engineering 实现人格分层、行为约束、分层汇报、安全审查等复杂协作协议
- **Framework-Agnostic** — 兼容 Claude Code、Codex、Cursor、OpenClaw、nanobot 等任意 CLI Agent
- **Zero Infrastructure** — 无需数据库/消息队列/容器，状态以 JSON 文件持久化，原子写保证崩溃安全

## Featured Showcase: 猫猫天团 — Persona-Driven Multi-Agent Team

> One TOML template, 6 persona-engineered LLM agents, a full software development team that self-organizes, communicates via structured protocols, and ships autonomously.

```bash
clawteam launch maomao-save-world --team catteam --goal "Build a social app for cat lovers"
```

### Team Composition & Agent Persona Engineering

猫猫天团是本框架的标志性 Team Template，通过 **TOML 模板 + 精细化 System Prompt** 实现了 6 个风格各异、职责互补的 LLM Agent 协作。每个 Agent 不仅有明确的技术分工，更有独立的**人格设定、沟通风格、行为约束**——展现了 Prompt Engineering 在多 Agent 场景下的深度应用。

```
                              Human (主人)
                                  │
                          Discord Bridge (inbox)
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │  🐱 总裁喵 (Leader)      │
                    │  梨花猫 · 傲娇但靠谱     │
                    │  Only plans & coordinates │
                    │  NEVER writes code        │
                    └─────┬───┬───┬───┬───┬───┘
                          │   │   │   │   │
          ┌───────────────┘   │   │   │   └───────────────┐
          ▼                   ▼   │   ▼                   ▼
  ┌──────────────┐  ┌────────────┐│┌────────────┐  ┌──────────────┐
  │ 🎨 美丽喵    │  │ 🏗️ 架构喵  │││ 🔒 平安喵   │  │ 📝 薯你最红喵│
  │ 布偶·前端    │  │ 奶牛·架构  │││ 大橘·安全   │  │ 金渐层·文案  │
  │ UI/UX/动效   │  │ 选型/接口  │││ 命令审查    │  │ 小红书运营   │
  └──────────────┘  └────────────┘│└────────────┘  └──────────────┘
                                  ▼
                          ┌──────────────┐
                          │ 🖥️ 后台喵    │
                          │ 三花·后端    │
                          │ API/DB/Auth  │
                          └──────────────┘
```

### Technical Depth Behind the Template

| Aspect | Implementation | Why It Matters |
|--------|---------------|----------------|
| **Persona-Layered Prompting** | 每个 Agent 的 System Prompt 包含人格、沟通风格、对不同角色的语气变化（对下属严厉 vs 对主人傲娇） | 展示了多层次 Prompt 工程，让 LLM 在不同对话上下文中表现不同行为 |
| **Hard-Coded Behavioral Constraints** | 总裁喵有「铁律：不亲自干活」，一旦发现自己在写代码必须停手并派任务 | 通过 Prompt 约束实现 Agent 角色边界，防止 LLM 角色漂移 |
| **Planning-First Protocol** | 强制流程：分析目标 → 拆 Milestone → 分配 → 汇报主人 → 确认后才 `task create` | 结构化工作流，防止 Agent 跳过规划直接执行 |
| **Hierarchical Reporting** | Worker → Leader → Human 的分层汇报链，Worker 不直接向 Human 汇报 Milestone | 信息聚合与过滤，避免人类被多 Agent 消息轰炸 |
| **Emergency Stop Propagation** | Leader 持续轮询 inbox，收到 stop 指令后立即 broadcast 全员停止 | 多 Agent 场景下的安全控制 — 人类始终拥有最终控制权 |
| **Security Review Pipeline** | 任何 `curl\|sh`、`sudo`、`eval` 等高危命令必须先发给平安喵审查 | Agent 间的权限制约，专门的 Security Agent 作为 guardrail |
| **Cross-Platform Communication** | Agent 通过 `clawteam inbox send` 与 Discord Bridge 双向通信，主人在 Discord 即可指挥和接收汇报 | Human-in-the-Loop 设计，CLI Agent 与即时通讯平台打通 |
| **Cost Enforcement via Prompt** | 每只猫完成任务后必须上报 token 用量，未上报的会被总裁喵催促 | 将成本管控嵌入 Agent 行为约束，而非外部监控 |

### Template Engine Design

模板使用 TOML 定义，支持变量替换（`{goal}`, `{team_name}`, `{agent_name}`），一条命令完成：建团队 → 注册成员 → 创建初始任务（含依赖链）→ 批量 spawn Agent 进程。

```toml
[template]
name = "maomao-save-world"
command = ["claude", "--model", "opus"]
backend = "tmux"

[template.leader]
name = "zong-cai-miao"
type = "task-coordinator"
task = """你是「总裁喵」... {goal} ..."""

[[template.agents]]
name = "mei-li-miao"
type = "frontend-designer"
task = """你是「美丽喵」... {goal} ..."""

[[template.tasks]]
subject = "（架构喵）模块划分与接口约定"
owner = "jia-gou-miao"
```

### What This Demonstrates

从技术角度，猫猫天团模板集中体现了以下能力：

1. **Advanced Prompt Engineering** — 不是简单的 "you are a helpful assistant"，而是包含人格分层、行为约束、工作流协议、异常处理的复杂 System Prompt 设计
2. **Multi-Agent Communication Protocol** — 点对点消息、分层汇报、广播、紧急停止等多种通信模式的实际运用
3. **Human-in-the-Loop Architecture** — Discord Bridge 让非技术用户也能参与 Agent 团队的指挥与监控
4. **Declarative Team Definition** — 一个 TOML 文件定义完整团队拓扑，体现 Infrastructure as Code 思想
5. **Agent Guardrails** — 通过角色分离（安全审查员）和行为约束实现 LLM Agent 安全治理

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | Python 3.10+ | Core runtime |
| **CLI Framework** | [Typer](https://typer.tiangolo.com/) | 40+ subcommands, auto-completion, `--json` structured output |
| **Data Modeling** | [Pydantic v2](https://docs.pydantic.dev/) | Type-safe models for Team, Task, Message, Config |
| **Terminal UI** | [Rich](https://rich.readthedocs.io/) | Kanban board, colored tables, live dashboard |
| **Interactive TUI** | [questionary](https://questionary.readthedocs.io/) | Profile wizard, interactive config |
| **Message Transport** | File I/O / [ZeroMQ](https://zeromq.org/) (pyzmq) | Pluggable transport: file (default) + P2P with auto-fallback |
| **Process Isolation** | tmux / subprocess | Agent spawn backends with session management |
| **Workspace Isolation** | Git Worktree | Per-agent branches, checkpoint/merge/conflict resolution |
| **Web Dashboard** | Built-in HTTP Server + SSE | Real-time board with Server-Sent Events |
| **Frontend (Website)** | Vite 5 + React 18 | Project documentation site |
| **Config Format** | TOML | Team templates with variable substitution |
| **Build System** | [Hatchling](https://hatch.pypa.io/) | Modern Python packaging |
| **Testing** | pytest (27 test files, 6,000+ lines) | Unit + integration tests |
| **Linting** | Ruff | Fast Python linter |
| **CI/CD** | GitHub Actions | Multi-OS (Ubuntu/macOS) × Multi-Python (3.10/3.11/3.12) matrix |

## Architecture

### System Overview

```
                          Human: "Build a full-stack app"
                                      │
                                      ▼
                    ┌─────────────────────────────────────┐
                    │         Leader Agent (LLM)          │
                    │  Claude Code / Codex / Any CLI      │
                    │                                     │
                    │  Calls ClawTeam CLI to orchestrate:  │
                    │  • spawn workers    • create tasks   │
                    │  • send messages    • monitor board   │
                    └──────────┬──────────┬───────────────┘
                               │          │
                  clawteam spawn    clawteam spawn
                               │          │
              ┌────────────────┘          └────────────────┐
              ▼                                            ▼
    ┌──────────────────┐                     ┌──────────────────┐
    │  Worker Agent A  │  ◄── inbox msg ──►  │  Worker Agent B  │
    │  (git worktree)  │                     │  (git worktree)  │
    │  (tmux session)  │                     │  (tmux session)  │
    └────────┬─────────┘                     └────────┬─────────┘
             │                                        │
             └──────────────┐    ┌────────────────────┘
                            ▼    ▼
                ┌──────────────────────────┐
                │   ~/.clawteam/ (State)   │
                │  ├── teams/    (config)  │
                │  ├── tasks/    (kanban)  │
                │  ├── inboxes/  (messages)│
                │  ├── events/   (audit)   │
                │  └── workspaces/ (code)  │
                └──────────────────────────┘
```

### Module Structure

```
clawteam/                          # 11,500+ lines Python
├── cli/
│   └── commands.py                # Typer app — 40+ subcommands entry point
├── team/                          # Core domain layer
│   ├── models.py                  # Pydantic models: TeamConfig, TaskItem, TeamMessage
│   ├── manager.py                 # TeamManager: create/join/discover teams, member registry
│   ├── tasks.py                   # TaskStore: per-task JSON, file locking, dependency auto-unblock
│   ├── mailbox.py                 # MailboxManager: send/receive/peek via Transport abstraction
│   ├── lifecycle.py               # Graceful shutdown protocol: request → approve → execute
│   ├── plan.py                    # Plan approval workflow: submit → review → approve/reject
│   ├── watcher.py                 # Team status watcher with polling
│   ├── waiter.py                  # Task completion waiter with timeout
│   ├── snapshot.py                # Team state snapshot & restore
│   └── costs.py                   # Token usage & cost tracking per agent
├── transport/                     # Pluggable message transport (Strategy Pattern)
│   ├── base.py                    # Transport ABC: deliver / fetch / count / list_recipients
│   ├── file.py                    # FileTransport: JSON file-based inbox
│   ├── p2p.py                     # P2PTransport: ZeroMQ PUSH/PULL + file fallback
│   └── claimed.py                 # Message deduplication & claim tracking
├── spawn/                         # Agent process management
│   ├── base.py                    # SpawnBackend ABC
│   ├── tmux_backend.py            # Tmux session spawner with auto-trust & prompt injection
│   ├── subprocess_backend.py      # Subprocess spawner for non-interactive agents
│   ├── prompt.py                  # Coordination prompt generator (injected into every agent)
│   ├── adapters.py                # CLI adapter normalization (claude/codex/nanobot/kimi)
│   ├── profiles.py                # Runtime profiles: provider + model + env config
│   ├── presets.py                 # Provider preset templates (Moonshot, MiniMax, etc.)
│   ├── sessions.py                # Spawn session tracking
│   ├── registry.py                # Agent registry
│   ├── command_validation.py      # Command safety validation
│   └── cli_env.py                 # Environment variable injection for spawned processes
├── workspace/                     # Git worktree isolation
│   ├── manager.py                 # Worktree create/list/merge/cleanup
│   ├── git.py                     # Git operations wrapper
│   ├── conflicts.py               # Merge conflict detection & resolution
│   ├── context.py                 # Diff/log/file context for agents
│   └── models.py                  # Workspace data models
├── board/                         # Monitoring & visualization
│   ├── collector.py               # BoardCollector: aggregate team/task/message data
│   ├── renderer.py                # Rich terminal renderer (kanban, tables)
│   ├── server.py                  # HTTP server with REST API + SSE real-time push
│   ├── cost_db.py                 # Cost data persistence
│   ├── gource.py                  # Gource visualization export
│   └── static/                    # Web dashboard (HTML/CSS/JS)
│       ├── index.html             # Real-time kanban board
│       └── costs.html             # Cost tracking dashboard
├── templates/                     # TOML team template engine
│   ├── __init__.py                # TemplateDef loader, variable substitution ({goal}, {team_name})
│   ├── hedge-fund.toml            # 7-agent investment analysis team
│   ├── software-dev.toml          # Full-stack development team
│   ├── research-paper.toml        # Academic research team
│   ├── code-review.toml           # Code review team
│   ├── strategy-room.toml         # Strategy discussion team
│   └── maomao-save-world.toml     # Custom team template with persona-driven agents
├── config.py                      # Layered config: ENV > config.json > defaults
├── identity.py                    # Agent identity: env-based (CLAWTEAM_* / CLAUDE_CODE_*)
└── timefmt.py                     # Timezone-aware time formatting

tests/                             # 6,000+ lines, 27 test files
├── conftest.py                    # Shared fixtures
├── test_cli_commands.py           # CLI integration tests
├── test_tasks.py                  # TaskStore unit tests
├── test_task_store_locking.py     # Concurrent file lock tests
├── test_mailbox.py                # Mailbox send/receive tests
├── test_inbox_routing.py          # Message routing tests
├── test_spawn_backends.py         # Tmux/subprocess backend tests
├── test_templates.py              # Template loading & rendering
├── test_profiles.py               # Profile management tests
├── ...                            # 18 more test files
```

## Key Design Decisions

### 1. Agent-as-User Architecture

Traditional multi-agent frameworks require humans to write orchestration code (DAGs, state machines). ClawTeam inverts this — the **LLM agent itself** is the orchestrator, calling CLI commands to manage teams. This leverages LLMs' tool-use capability and eliminates the need for framework-specific SDKs.

### 2. Pluggable Transport Layer (Strategy Pattern)

```python
class Transport(ABC):
    def deliver(self, recipient: str, data: bytes) -> None: ...
    def fetch(self, agent_name: str, limit: int, consume: bool) -> list[bytes]: ...
    def count(self, agent_name: str) -> int: ...
    def list_recipients(self) -> list[str]: ...
```

- **FileTransport**: JSON files in inbox directories, zero-dependency, single-machine
- **P2PTransport**: ZeroMQ PUSH/PULL sockets with peer discovery + automatic file fallback on failure

### 3. Crash-Safe State Management

All state mutations use **atomic tmp + rename** pattern — a temporary file is written first, then atomically renamed. This ensures no partial writes on crash, without needing a database or WAL.

### 4. Git Worktree Isolation

Each spawned agent gets its own git worktree (`clawteam/{team}/{agent}` branch), enabling true parallel development without merge conflicts. The leader agent can checkpoint, merge, and resolve conflicts across worktrees.

### 5. Auto-Injected Coordination Prompt

Every spawned agent receives a **coordination prompt** that teaches it the ClawTeam protocol (check tasks, update status, send messages, report idle). This means any CLI agent capable of running shell commands can participate — no custom integration needed.

### 6. Task Dependency Graph with Auto-Unblock

Tasks support `blocked_by` dependencies. When a blocking task is marked `completed`, all dependent tasks are automatically unblocked. This enables DAG-style execution without manual intervention.

## API Design

### REST Endpoints (Board Server)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/overview` | GET | All teams summary |
| `/api/team/<name>` | GET | Team detail with members, tasks, messages |
| `/api/events/<team>` | GET | Event history (SSE-compatible) |
| `/api/costs/<team>` | GET | Per-agent token usage & cost breakdown |

### CLI Command Groups

| Group | Commands | Description |
|-------|----------|-------------|
| `team` | spawn-team, discover, status, cleanup, snapshot | Team lifecycle management |
| `task` | create, get, update, list, stats, wait | Task CRUD with dependency tracking |
| `inbox` | send, broadcast, receive, peek, log, watch | Inter-agent messaging |
| `spawn` | tmux, subprocess + profile/preset | Agent process spawning |
| `board` | show, live, attach, serve, overview | Monitoring & dashboards |
| `workspace` | list, checkpoint, merge, cleanup, status | Git worktree management |
| `plan` | submit, approve, reject | Plan approval workflow |
| `lifecycle` | request-shutdown, approve, reject, idle | Graceful lifecycle protocol |
| `config` | show, set, get, health | Configuration management |
| `profile` | wizard, doctor, test, list | Runtime profile management |
| `template` | list, show | Team template browsing |
| `launch` | (top-level) | One-command team creation from template |

## Scalability & Production Use

- **8-Agent GPU Cluster**: Orchestrated 8 specialized ML research agents across 8×H100 GPUs, completing 2,430+ autonomous experiments with 6.4% performance improvement
- **Persona-Driven Agent Team**: 猫猫天团模板 — 6 个角色化 LLM Agent（Leader / Frontend / Backend / Architect / Security / Copywriter）通过结构化协议自主协作，展示多 Agent Prompt Engineering 的深度实践
- **Cross-Machine**: Supports distributed teams via shared filesystem (NFS/SSHFS) or P2P transport
- **Multi-User**: Namespace isolation via `(user, agent_name)` composite keys
- **Human-in-the-Loop**: Discord Bridge 双向通信，非技术用户可在 IM 中直接指挥 Agent 团队
- **Cost Tracking**: Per-agent token usage monitoring with budget alerts, enforced via prompt-level constraints

## Development

```bash
# Install from source
git clone https://github.com/HKUDS/ClawTeam.git
cd ClawTeam
pip install -e ".[dev]"

# Run tests (27 test files, multi-OS × multi-Python CI)
pytest tests/ -v

# Lint
ruff check clawteam/ tests/

# Optional: P2P transport
pip install -e ".[p2p]"
```

## License

MIT
