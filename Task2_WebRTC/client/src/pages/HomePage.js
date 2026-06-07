import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import logo from "../img/logo.png";

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.25rem 2rem",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-2)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    fontSize: 20,
    letterSpacing: "-0.02em",
  },
  logoIcon: {
    width: 32,
    height: 32,
    background: "var(--accent)",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  navRight: { display: "flex", alignItems: "center", gap: "0.75rem" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
  },
  username: {
    fontSize: 13,
    color: "var(--text-2)",
    fontFamily: "var(--font-mono)",
  },
  logoutBtn: {
    padding: "7px 16px",
    background: "var(--danger-dim)",
    border: "1px solid var(--danger)",
    borderRadius: 8,
    color: "var(--danger)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.03em",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 2rem",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "5px 14px",
    background: "var(--accent-dim)",
    color: "var(--accent)",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.06em",
    marginBottom: "1.5rem",
    border: "1px solid rgba(0,229,160,0.2)",
  },
  h1: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    marginBottom: "1rem",
  },
  sub: {
    fontSize: 18,
    color: "var(--text-2)",
    maxWidth: 500,
    lineHeight: 1.6,
    marginBottom: "3rem",
  },
  cards: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    maxWidth: 700,
  },
  card: {
    flex: "1 1 280px",
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-2)",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "var(--bg-3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text)",
    fontSize: 13,
    marginBottom: "1rem",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.05em",
  },
  btnGreen: {
    width: "100%",
    padding: "13px",
    background: "var(--accent)",
    color: "#000",
    fontWeight: 700,
    fontSize: 15,
    borderRadius: "var(--radius)",
    border: "none",
    cursor: "pointer",
  },
  btnBlue: {
    width: "100%",
    padding: "13px",
    background: "var(--accent-2)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    borderRadius: "var(--radius)",
    border: "none",
    cursor: "pointer",
  },
  features: {
    display: "flex",
    gap: "2rem",
    marginTop: "4rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  feat: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "var(--text-2)",
  },
  featDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
  },
  error: {
    padding: "8px 12px",
    background: "var(--danger-dim)",
    border: "1px solid var(--danger)",
    borderRadius: 8,
    fontSize: 13,
    color: "var(--danger)",
    marginBottom: "1rem",
  },
};

const FEATURES = [
  "Video Calling",
  "Screen Sharing",
  "File Sharing",
  "Whiteboard",
  "End-to-End Chat",
  "Multi-User",
];

export default function HomePage({ onJoinRoom }) {
  const { user, logout } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await axios.post("/api/rooms/create");
      onJoinRoom(r.data.roomId);
    } catch {
      setError("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    const id = roomId.trim().toUpperCase();
    if (!id) {
      setError("Enter a room ID");
      return;
    }
    onJoinRoom(id);
  };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.logo}>
          <img
            src={logo}
            alt="SyncRoom Logo"
            style={{
              height: "24px",
              marginRight: "8px",
              verticalAlign: "middle",
            }}
          />
          SyncRoom
        </div>
        <div style={s.navRight}>
          <div style={s.avatar}>{user?.username?.charAt(0).toUpperCase()}</div>
          <span style={s.username}>
            {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
          </span>
          <button style={s.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={s.hero}>
        <div style={s.badge}>REAL-TIME COLLABORATION</div>
        <h1 style={s.h1}>
          Meet.
          <br />
          Share.
          <br />
          <span style={{ color: "var(--accent)" }}>Create.</span>
        </h1>
        <p style={s.sub}>
          Video calls, screen sharing, whiteboard, and file sharing — all in one
          secure room.
        </p>

        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.cardTitle}>New Room</div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-2)",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Create a room and share the ID with others to collaborate
              instantly.
            </p>
            <button style={s.btnGreen} onClick={createRoom} disabled={loading}>
              {loading ? "Creating..." : "+ Create Room"}
            </button>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Join Room</div>
            {error && <div style={s.error}>{error}</div>}
            <input
              style={s.input}
              placeholder="Enter Room ID (e.g. A1B2C3)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              maxLength={8}
            />
            <button style={s.btnBlue} onClick={joinRoom}>
              → Join Room
            </button>
          </div>
        </div>

        <div style={s.features}>
          {FEATURES.map((f) => (
            <div key={f} style={s.feat}>
              <div style={s.featDot} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
