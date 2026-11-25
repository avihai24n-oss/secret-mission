import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import "@fontsource/heebo/400.css";
import "@fontsource/heebo/500.css";
import "@fontsource/heebo/700.css";
import "@fontsource/heebo/900.css";
import "@fontsource/karantina/400.css";
import "@fontsource/karantina/700.css";
import "./index.css";
import App from "./App";
import { useGame } from "./game/store";

// Decide the first screen before the first paint (demo, saved room, invite link).
useGame.getState().boot();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>
);
