import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../img/logo.png";

// Inline styles - no styled-components needed
const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    opacity: 0.04,
    backgroundImage:
      "linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
  },
  box: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "420px",
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "2.5rem 2.5rem 2rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2.5rem",
  },
  logoImg: { height: 40, width: 40, objectFit: "contain" },
  logoText: {
    fontFamily: "var(--font-head)",
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "-0.02em",
  },
  tabs: {
    display: "flex",
    gap: 4,
    background: "var(--bg-3)",
    borderRadius: 8,
    padding: 4,
    marginBottom: "2rem",
  },
  tab: (active) => ({
    flex: 1,
    padding: "8px 0",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    background: active ? "var(--bg-4)" : "transparent",
    color: active ? "var(--text)" : "var(--text-2)",
    border: active ? "1px solid var(--border)" : "none",
    cursor: "pointer",
    transition: "all 0.15s",
  }),
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text-2)",
    marginBottom: 8,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 14,
    borderRadius: "var(--radius)",
    border: "1px solid var(--border-hi)",
    background: "var(--bg-4)",
    color: "var(--text)",
    marginBottom: "1rem",
    outline: "none",
  },
  btn: {
    width: "100%",
    padding: "13px",
    background: "#00c287",
    color: "#000",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: "var(--radius)",
    border: "none",
    cursor: "pointer",
    letterSpacing: "0.04em",
    marginTop: 8,
    textTransform: "uppercase",
  },
  error: {
    background: "var(--danger-dim)",
    border: "1px solid var(--danger)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "var(--danger)",
    marginBottom: "1rem",
  },
  demo: {
    marginTop: "1.5rem",
    padding: "1rem",
    background: "var(--bg-3)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--text-2)",
    textAlign: "center",
  },
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") await login(username, password);
      else await register(username, password);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />
      <div style={styles.box}>
        <div style={styles.logo}>
          <img src={logo} alt="SyncRoom" style={styles.logoImg} />
          <div>
            <div style={styles.logoText}>SyncRoom</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 1 }}>
              Real-Time Collaboration
            </div>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            style={styles.tab(mode === "login")}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            style={styles.tab(mode === "register")}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={submit}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoFocus
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "→ Sign In"
                : "→ Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
