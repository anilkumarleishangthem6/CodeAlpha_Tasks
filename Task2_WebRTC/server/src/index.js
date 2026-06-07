require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const fileRoutes = require("./routes/files");
const { authenticateSocket } = require("./middleware/auth");
const RoomManager = require("./managers/RoomManager");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 50e6,
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/files", fileRoutes);

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() }),
);

const roomManager = new RoomManager();

io.use(authenticateSocket);

io.on("connection", (socket) => {
  const user = socket.user;
  console.log(`[CONNECT] ${user.username} (${socket.id})`);

  // ─── Room Management ───────────────────────────────────────
  socket.on("room:join", ({ roomId }) => {
    const room = roomManager.joinRoom(roomId, {
      id: user.id,
      username: user.username,
      socketId: socket.id,
    });
    socket.join(roomId);
    socket.currentRoom = roomId;
    socket.to(roomId).emit("room:user-joined", {
      user: { id: user.id, username: user.username, socketId: socket.id },
    });
    socket.emit("room:joined", { room: roomManager.getRoom(roomId) });
    console.log(`[ROOM] ${user.username} joined room ${roomId}`);
  });

  socket.on("room:leave", () => {
    if (socket.currentRoom) {
      roomManager.leaveRoom(socket.currentRoom, socket.id);
      socket
        .to(socket.currentRoom)
        .emit("room:user-left", { socketId: socket.id });
      socket.leave(socket.currentRoom);
      socket.currentRoom = null;
    }
  });

  // ─── WebRTC Signaling ──────────────────────────────────────
  socket.on("webrtc:offer", ({ to, offer }) => {
    io.to(to).emit("webrtc:offer", {
      from: socket.id,
      offer,
      username: user.username,
    });
  });

  socket.on("webrtc:answer", ({ to, answer }) => {
    io.to(to).emit("webrtc:answer", {
      from: socket.id,
      answer,
      username: user.username,
    });
  });

  socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("webrtc:ice-candidate", { from: socket.id, candidate });
  });

  // ─── Media State (mute/cam) ────────────────────────────────
  socket.on("media:toggle", ({ type, enabled }) => {
    if (socket.currentRoom) {
      socket
        .to(socket.currentRoom)
        .emit("media:toggle", { socketId: socket.id, type, enabled });
    }
  });

  // ─── Screen Share ──────────────────────────────────────────
  socket.on("screen:start", () => {
    if (socket.currentRoom) {
      socket
        .to(socket.currentRoom)
        .emit("screen:start", { socketId: socket.id, username: user.username });
    }
  });

  socket.on("screen:stop", () => {
    if (socket.currentRoom) {
      socket
        .to(socket.currentRoom)
        .emit("screen:stop", { socketId: socket.id });
    }
  });

  // ─── Chat ──────────────────────────────────────────────────
  socket.on("chat:message", ({ message }) => {
    if (socket.currentRoom && message?.trim()) {
      const msg = {
        id: Date.now(),
        user: user.username,
        text: message.trim(),
        time: new Date().toISOString(),
      };
      io.to(socket.currentRoom).emit("chat:message", msg);
    }
  });

  // ─── File Sharing ──────────────────────────────────────────
  socket.on("file:share", ({ name, size, type, dataUrl }) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit("file:shared", {
        id: Date.now(),
        name,
        size,
        type,
        dataUrl,
        from: user.username,
        time: new Date().toISOString(),
      });
    }
  });

  // ─── Whiteboard ────────────────────────────────────────────
  socket.on("whiteboard:draw", (drawData) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit("whiteboard:draw", drawData);
    }
  });

  socket.on("whiteboard:clear", () => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit("whiteboard:clear");
    }
  });

  socket.on("whiteboard:undo", ({ history }) => {
    if (socket.currentRoom) {
      socket.to(socket.currentRoom).emit("whiteboard:sync", { history });
    }
  });

  // ─── Disconnect ────────────────────────────────────────────
  socket.on("disconnect", () => {
    if (socket.currentRoom) {
      roomManager.leaveRoom(socket.currentRoom, socket.id);
      socket
        .to(socket.currentRoom)
        .emit("room:user-left", { socketId: socket.id });
    }
    console.log(`[DISCONNECT] ${user.username} (${socket.id})`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SyncRoom Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});
