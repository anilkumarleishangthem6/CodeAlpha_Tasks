import React, { useRef, useEffect, useState, useCallback } from "react";

const COLORS = [
  "#00e5a0",
  "#4d8cff",
  "#ff4d6a",
  "#ffaa00",
  "#ffffff",
  "#888",
  "#000",
];
const SIZES = [2, 4, 8, 16];

export default function Whiteboard({ socket }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const historyRef = useRef([]);
  const [tool, setTool] = useState("pen"); // pen | eraser | line | rect
  const [color, setColor] = useState("#00e5a0");
  const [size, setSize] = useState(4);
  const lastPos = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const redraw = useCallback((history) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    history.forEach((cmd) => drawCommand(ctx, cmd));
  }, []);

  const drawCommand = (ctx, cmd) => {
    ctx.strokeStyle = cmd.color;
    ctx.lineWidth = cmd.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (cmd.tool === "pen" || cmd.tool === "eraser") {
      if (cmd.tool === "eraser") ctx.strokeStyle = "#141417";
      ctx.beginPath();
      ctx.moveTo(cmd.x0, cmd.y0);
      ctx.lineTo(cmd.x1, cmd.y1);
      ctx.stroke();
    } else if (cmd.tool === "line") {
      ctx.beginPath();
      ctx.moveTo(cmd.x0, cmd.y0);
      ctx.lineTo(cmd.x1, cmd.y1);
      ctx.stroke();
    } else if (cmd.tool === "rect") {
      ctx.strokeRect(cmd.x0, cmd.y0, cmd.x1 - cmd.x0, cmd.y1 - cmd.y0);
    }
  };

  const emit = useCallback(
    (cmd) => {
      historyRef.current.push(cmd);
      const canvas = canvasRef.current;
      if (canvas) drawCommand(canvas.getContext("2d"), cmd);
      socket?.emit("whiteboard:draw", cmd);
    },
    [socket, color, size],
  );

  useEffect(() => {
    if (!socket) return;
    const onDraw = (cmd) => {
      historyRef.current.push(cmd);
      const canvas = canvasRef.current;
      if (canvas) drawCommand(canvas.getContext("2d"), cmd);
    };
    const onClear = () => {
      historyRef.current = [];
      redraw([]);
    };
    const onSync = ({ history }) => {
      historyRef.current = history;
      redraw(history);
    };

    socket.on("whiteboard:draw", onDraw);
    socket.on("whiteboard:clear", onClear);
    socket.on("whiteboard:sync", onSync);
    return () => {
      socket.off("whiteboard:draw", onDraw);
      socket.off("whiteboard:clear", onClear);
      socket.off("whiteboard:sync", onSync);
    };
  }, [socket, redraw]);

  const onMouseDown = (e) => {
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    if (tool === "line" || tool === "rect") {
      lastPos.current._start = { ...lastPos.current };
    }
  };

  const onMouseMove = (e) => {
    if (!drawing.current) return;
    const pos = getPos(e, canvasRef.current);
    if (tool === "pen" || tool === "eraser") {
      emit({
        tool,
        color,
        size,
        x0: lastPos.current.x,
        y0: lastPos.current.y,
        x1: pos.x,
        y1: pos.y,
      });
      lastPos.current = pos;
    } else {
      // Preview for line/rect
      redraw(historyRef.current);
      const ctx = canvasRef.current.getContext("2d");
      const start = lastPos.current._start;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        ctx.strokeRect(start.x, start.y, pos.x - start.x, pos.y - start.y);
      }
    }
  };

  const onMouseUp = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    if (tool === "line" || tool === "rect") {
      const pos = getPos(e, canvasRef.current);
      const start = lastPos.current._start;
      emit({
        tool,
        color,
        size,
        x0: start.x,
        y0: start.y,
        x1: pos.x,
        y1: pos.y,
      });
    }
    lastPos.current = null;
  };

  const clearBoard = () => {
    historyRef.current = [];
    redraw([]);
    socket?.emit("whiteboard:clear");
  };

  const undo = () => {
    historyRef.current.pop();
    redraw(historyRef.current);
    socket?.emit("whiteboard:undo", { history: historyRef.current });
  };

  const toolBtn = (t, label) => ({
    padding: "7px 12px",
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    background: tool === t ? "var(--accent-dim)" : "var(--bg-3)",
    color: tool === t ? "var(--accent)" : "var(--text-2)",
    border:
      tool === t ? "1px solid rgba(0,229,160,0.3)" : "1px solid var(--border)",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: 8,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          padding: "8px 12px",
          background: "var(--bg-3)",
          borderRadius: 10,
          border: "1px solid var(--border)",
        }}
      >
        {/* Tools */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            ["pen", "✏️ Pen"],
            ["eraser", "⬜ Eraser"],
            ["line", "╱ Line"],
            ["rect", "▭ Rect"],
          ].map(([t, l]) => (
            <button key={t} style={toolBtn(t)} onClick={() => setTool(t)}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "var(--border)" }} />

        {/* Colors */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("pen");
              }}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: c,
                border:
                  color === c ? "2px solid white" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: "var(--border)" }} />

        {/* Sizes */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {SIZES.map((sz) => (
            <button
              key={sz}
              onClick={() => setSize(sz)}
              style={{
                width: sz + 12,
                height: sz + 12,
                borderRadius: "50%",
                background: size === sz ? "var(--accent)" : "var(--bg-4)",
                border: "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button
            onClick={undo}
            style={{ ...toolBtn("_"), padding: "7px 12px" }}
          >
            ↩ Undo
          </button>
          <button
            onClick={clearBoard}
            style={{
              ...toolBtn("_"),
              color: "var(--danger)",
              borderColor: "rgba(255,77,106,0.3)",
            }}
          >
            🗑 Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid var(--border)",
          cursor: tool === "eraser" ? "cell" : "crosshair",
        }}
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={700}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#141417",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
        />
      </div>
    </div>
  );
}
