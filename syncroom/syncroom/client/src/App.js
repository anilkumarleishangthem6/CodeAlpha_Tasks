import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider, useSocket } from "./context/SocketContext";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import RoomPage from "./pages/RoomPage";

function AppInner() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const [currentRoom, setCurrentRoom] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
          <div
            style={{
              color: "var(--text-2)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
            }}
          >
            Loading SyncRoom...
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (currentRoom) {
    return (
      <RoomPage
        roomId={currentRoom}
        socket={socket}
        onLeave={() => setCurrentRoom(null)}
      />
    );
  }

  return <HomePage onJoinRoom={(id) => setCurrentRoom(id)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppInner />
      </SocketProvider>
    </AuthProvider>
  );
}
