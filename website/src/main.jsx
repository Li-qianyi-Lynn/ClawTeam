import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./team-intro/team-intro.css";
import TeamIntroPage from "./team-intro/index.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TeamIntroPage />
  </React.StrictMode>
);
