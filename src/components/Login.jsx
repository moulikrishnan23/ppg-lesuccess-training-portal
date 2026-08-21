import { useState } from "react";
import { callServer } from "../services/appsScript";

const LOGIN_LOGO = "/ppg-logo.jpg";
const PARTNER_LOGO = "https://dortbyfaot8ak.cloudfront.net/wp-content/uploads/2023/11/2138lesuccess.png";

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter both User ID and Password.");
      return;
    }

    setBusy(true);
    try {
      const result = await callServer("login", userId.trim(), password);
      if (result?.success) {
        onLogin(result);
      } else {
        setError(result?.message || "Login failed.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="loginScreen">
      <div className="login-card">
        <img className="crest" src={LOGIN_LOGO} alt="PPG" />
        <h1>PPG Training Management Portal</h1>
        <p className="sub">Sign in to continue</p>

        <form onSubmit={submit}>
          <div className="field">
            <label>User ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </button>

          <div id="loginError">{error}</div>
        </form>

        <div className="login-footer">
          <img
            src={PARTNER_LOGO}
            alt="LeSuccess"
            style={{ height: 22, opacity: 0.85, marginBottom: 4 }}
          />
          <br />
          Learn. Educate. Succeed.
        </div>
      </div>
    </div>
  );
}
