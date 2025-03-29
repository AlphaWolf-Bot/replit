import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/theme.css";
import "./styles/animations.css";
import { initTelegramWebApp } from "./lib/telegram";

// Initialize Telegram WebApp if available
initTelegramWebApp();

createRoot(document.getElementById("root")!).render(<App />);
