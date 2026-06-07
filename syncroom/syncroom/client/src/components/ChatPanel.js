import React, { useState, useEffect, useRef } from "react";

export default function ChatPanel({ socket, username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) =>
      setMessages((prev) => [...prev, { ...msg, type: "chat" }]);
    const onFile = (f) =>
      setMessages((prev) => [...prev, { ...f, type: "file" }]);
    socket.on("chat:message", onMsg);
    socket.on("file:shared", onFile);
    return () => {
      socket.off("chat:message", onMsg);
      socket.off("file:shared", onFile);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    socket?.emit("chat:message", { message: input.trim() });
    setInput("");
  };

  const sendFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Max file size is 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      socket?.emit("file:share", {
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: reader.result,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result,
          from: username,
          time: new Date().toISOString(),
          msgType: "file",
        },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(1) + " MB";
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--bg-2)",
        borderRadius: 12,
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: "var(--text-2)",
          textTransform: "uppercase",
        }}
      >
        Chat & Files
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: 13,
              marginTop: "2rem",
            }}
          >
            No messages yet.
            <br />
            Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user === username || msg.from === username;
          if (msg.type === "file" || msg.msgType === "file") {
            const isImg =
              msg.type?.startsWith("image/") ||
              msg.dataUrl?.startsWith("data:image");
            return (
              <div
                key={msg.id || i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMe ? "flex-end" : "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    marginBottom: 4,
                  }}
                >
                  {msg.from || msg.user}
                </span>
                <div
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    maxWidth: "85%",
                  }}
                >
                  {isImg && (
                    <img
                      src={msg.dataUrl}
                      alt={msg.name}
                      style={{
                        maxWidth: "100%",
                        borderRadius: 6,
                        marginBottom: 6,
                        display: "block",
                      }}
                    />
                  )}
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 18 }}>📎</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {msg.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)" }}>
                        {formatSize(msg.size)}
                      </div>
                    </div>
                    {msg.dataUrl && (
                      <a
                        href={msg.dataUrl}
                        download={msg.name}
                        style={{
                          marginLeft: "auto",
                          padding: "5px 10px",
                          background: "var(--accent-dim)",
                          color: "var(--accent)",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ↓
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              key={msg.id || i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
              }}
            >
              {!isMe && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-3)",
                    marginBottom: 3,
                  }}
                >
                  {msg.user}
                </span>
              )}
              <div
                style={{
                  padding: "9px 13px",
                  borderRadius: 10,
                  maxWidth: "85%",
                  fontSize: 14,
                  lineHeight: 1.4,
                  background: isMe ? "var(--accent)" : "var(--bg-4)",
                  color: isMe ? "#000" : "var(--text)",
                  borderBottomRightRadius: isMe ? 3 : 10,
                  borderBottomLeftRadius: isMe ? 10 : 3,
                }}
              >
                {msg.text}
              </div>
              <span
                style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}
              >
                {formatTime(msg.time)}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            borderRadius: 8,
            minWidth: 0,
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={sendFile}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "9px 11px",
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          📎
        </button>
        <button
          onClick={send}
          style={{
            padding: "8px 12px",
            background: "var(--accent)",
            color: "#000",
            fontWeight: 700,
            borderRadius: 8,
            fontSize: 13,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
 