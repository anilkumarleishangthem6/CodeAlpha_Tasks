import React, { useEffect, useRef } from "react";

export default function VideoTile({
  stream,
  username,
  audioEnabled = true,
  videoEnabled = true,
  isLocal = false,
  isScreenShare = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  return (
    <div
      style={{
        position: "relative",
background: "var(--bg-3)",
borderRadius: 12,
overflow: "hidden",
width: "100%",
aspectRatio: "4/3",
maxHeight: "100%",
border: "1px solid var(--border)",
display: "flex",
alignItems: "center",
justifyContent: "center",
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
          display: stream && videoEnabled && stream.getVideoTracks().length > 0 ? "block" : "none",
          transform: isLocal && !isScreenShare ? "scaleX(-1)" : "none",
        }}
      />

      {/* Avatar fallback */}
      {(!stream || !videoEnabled || stream.getVideoTracks().length === 0) && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--accent-dim)",
              border: "2px solid var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--accent)",
              fontFamily: "var(--font-head)",
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-2)" }}>
            Camera off
          </span>
        </div>
      )}

      {/* Name tag */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 12,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {!audioEnabled && (
          <svg
            width="11"
            height="11"
            fill="none"
            stroke="var(--danger)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
        {isScreenShare && (
          <svg
            width="11"
            height="11"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        )}
        <span>
          {username}
          {isLocal ? " (You)" : ""}
        </span>
      </div>

      {/* Muted indicator */}
      {!audioEnabled && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "var(--danger)",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="white"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>
      )}
    </div>
  );
}
