// src/authCheck.js
export async function checkAuth() {
  const hostname = window.location.hostname;
  const isLocal =
    hostname.includes("localhost") || hostname.includes("127.");

  // 🧪 LOCAL DEV → skip auth completely
  if (isLocal) {
    console.warn("🧪 Localhost detected — skipping authentication");
    return true;
  }

  // 🧠 API base (Flask backend)
  const apiBase = "https://midasrndfrontendbackend-production.up.railway.app/api";

  // 🧠 Main portal base for login
  const portalBase = "https://www.midasmedialk.agency"; // ✅ fixed with 'www'

  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      credentials: "include", // ✅ include cookies for JWT
    });

    if (!res.ok) {
      const current = encodeURIComponent(window.location.href);
      window.location.href = `${portalBase}/signin?redirect=${current}`;
      return false;
    }

    const user = await res.json();
    console.log("✅ Authenticated user:", user);
    return true;
  } catch (err) {
    console.error("❌ Auth check failed:", err);
    const current = encodeURIComponent(window.location.href);
    window.location.href = `${portalBase}/signin?redirect=${current}`;
    return false;
  }
}
