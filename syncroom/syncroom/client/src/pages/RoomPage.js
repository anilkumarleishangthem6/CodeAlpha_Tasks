import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";
import VideoTile from "../components/VideoTile";
import ChatPanel from "../components/ChatPanel";
import Whiteboard from "../components/Whiteboard";
import logo from "../img/logo.png";

const BTN = (active, danger) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  padding: "10px 0",
  width: 72,
  background: danger
    ? "var(--danger-dim)"
    : active
      ? "var(--bg-4)"
      : "var(--bg-3)",
  border: `1px solid ${danger ? "var(--danger)" : active ? "var(--border-hi)" : "var(--border)"}`,
  borderRadius: 10,
  cursor: "pointer",
  color: danger ? "var(--danger)" : active ? "var(--text)" : "var(--text-2)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.04em",
  transition: "all 0.15s",
});

export default function RoomPage({ roomId, socket, onLeave }) {
  const { user } = useAuth();
  const [roomUsers, setRoomUsers] = useState([]);
  const [tab, setTab] = useState("video"); // video | whiteboard
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    localStream,
    peers,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    startMedia,
    cleanup,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(socket, roomId, user);

  // Join room on mount
  useEffect(() => {
    if (!socket || !roomId) return;

    const init = async () => {
      await startMedia(true, true);
      socket.emit("room:join", { roomId });
      setJoined(true);
    };

    const onJoined = ({ room }) => {
      setRoomUsers(room.users || []);
    };

    const onUserJoined = ({ user: u }) => {
      setRoomUsers((prev) => [
        ...prev.filter((x) => x.socketId !== u.socketId),
        u,
      ]);
    };

    const onUserLeft = ({ socketId }) => {
      setRoomUsers((prev) => prev.filter((x) => x.socketId !== socketId));
    };

    socket.on("room:joined", onJoined);
    socket.on("room:user-joined", onUserJoined);
    socket.on("room:user-left", onUserLeft);

    init();

    return () => {
      socket.off("room:joined", onJoined);
      socket.off("room:user-joined", onUserJoined);
      socket.off("room:user-left", onUserLeft);
    };
  }, [socket, roomId]);

  const leave = () => {
    socket?.emit("room:leave");
    cleanup();
    onLeave();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const peerList = Object.entries(peers);
  const totalVideos = 1 + peerList.length;

  const gridCols =
    totalVideos <= 1 ? 1 : totalVideos <= 2 ? 2 : totalVideos <= 4 ? 2 : 3;

  return (
    <div
      style={{
        height: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "var(--bg-2)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={logo}
            alt="SyncRoom"
            style={{ height: 28, width: "auto", objectFit: "contain" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>Room:</span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--accent)",
              }}
            >
              {roomId}
            </span>
            <button
              onClick={copyRoomId}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-2)",
                padding: "2px 6px",
              }}
            >
              {copied ? "✓" : "⎘"}
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-2)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--accent)",
              }}
            />
            {roomUsers.length} participant{roomUsers.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--bg-3)",
            borderRadius: 8,
            padding: 3,
          }}
        >
          {[
            ["video", "Video"],
            ["whiteboard", "Board"],
          ].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                background: tab === t ? "var(--bg-4)" : "transparent",
                color: tab === t ? "var(--text)" : "var(--text-2)",
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--accent)",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-2)" }}>
            {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        {/* Left: Video / Whiteboard */}
        <div
          style={{
            flex: 1,
            padding: "16px",
            overflow: "auto",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {tab === "video" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gap: 12,
                width: "100%",
                maxHeight: "100%",
                alignItems: "start",
              }}
            >
              {/* Local video */}
              <VideoTile
                stream={isScreenSharing ? null : localStream}
                username={user?.username}
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                isLocal={true}
              />
              {/* Screen share tile */}
              {isScreenSharing && (
                <VideoTile
                  stream={localStream}
                  username={user?.username}
                  isLocal={true}
                  isScreenShare={true}
                />
              )}
              {/* Remote peers */}
              {peerList.map(([socketId, peer]) => (
                <VideoTile
                  key={socketId}
                  stream={peer.stream}
                  username={peer.username || "Peer"}
                  audioEnabled={peer.audioEnabled !== false}
                  videoEnabled={peer.videoEnabled !== false}
                />
              ))}
            </div>
          ) : (
            <div style={{ height: "100%" }}>
              <Whiteboard socket={socket} />
            </div>
          )}
        </div>

        {/* Right: Chat */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            padding: "16px 16px 16px 0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ChatPanel socket={socket} username={user?.username} />
        </div>
      </div>

      {/* Control Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "14px 24px",
          background: "var(--bg-2)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <button style={BTN(!audioEnabled)} onClick={toggleAudio}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            {!audioEnabled && <line x1="1" y1="1" x2="23" y2="23" />}
          </svg>
          {audioEnabled ? "Mute" : "Unmute"}
        </button>

        <button style={BTN(!videoEnabled)} onClick={toggleVideo}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" />
            {!videoEnabled && <line x1="1" y1="1" x2="23" y2="23" />}
          </svg>
          {videoEnabled ? "Stop Vid" : "Start Vid"}
        </button>

        <button
          style={BTN(isScreenSharing)}
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          {isScreenSharing ? "Stop Share" : "Share Screen"}
        </button>

        <button
          style={BTN(tab === "whiteboard")}
          onClick={() => setTab(tab === "whiteboard" ? "video" : "whiteboard")}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          Board
        </button>

        <div
          style={{
            width: 1,
            height: 40,
            background: "var(--border)",
            margin: "0 8px",
          }}
        />

        <button style={BTN(false, true)} onClick={leave}>
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.68 19.79 19.79 0 0 1 1.36 1.05 2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
          Leave
        </button>
      </div>
    </div>
  );
}
