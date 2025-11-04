import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { checkAuth } from "./authCheck.js";

// 🧠 Immediately show white screen + small message
document.body.style.margin = "0";
document.body.innerHTML = `
  <div id="pre-auth-screen"
    style="
      display:flex;
      align-items:center;
      justify-content:center;
      height:100vh;
      background:white;
      color:#3bb9af;
      font-family:Arial, sans-serif;
      font-size:18px;
      letter-spacing:0.5px;
    ">
    Authorization Processing...
  </div>
`;

// 🚀 Run auth check before rendering
async function startApp() {
  const authorized = await checkAuth();
  if (!authorized) return; // redirect handled inside checkAuth

  // 🧹 Clear pre-auth screen
  document.body.innerHTML = `<div id="root"></div>`;

  // ✅ Now render app safely
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

startApp();
