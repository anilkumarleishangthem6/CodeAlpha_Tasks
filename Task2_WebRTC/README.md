# SyncRoom — Real-Time Communication App
### CodeAlpha Internship — Task 4

A full-stack video conferencing and collaboration platform built with WebRTC, Socket.io, and React.

---

## Features

| Feature | Technology |
|---|---|
| Multi-user video calling | WebRTC (peer-to-peer) |
| Screen sharing | `getDisplayMedia` API |
| File sharing | Socket.io (base64 transfer) |
| Collaborative whiteboard | HTML5 Canvas + Socket.io |
| Real-time chat | Socket.io |
| User authentication | JWT + bcrypt |
| Data encryption | HTTPS + JWT tokens |

---

## Project Structure

```
syncroom/
├── server/                  # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── index.js         # Main server + Socket events
│   │   ├── routes/
│   │   │   ├── auth.js      # Login / Register (JWT)
│   │   │   ├── rooms.js     # Room creation
│   │   │   └── files.js     # File upload endpoint
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT middleware
│   │   └── managers/
│   │       └── RoomManager.js  # Room state management
│   └── .env
│
├── client/                  # React frontend
│   └── src/
│       ├── App.js           # Root + routing
│       ├── context/
│       │   ├── AuthContext.js   # Auth state + JWT
│       │   └── SocketContext.js # Socket.io connection
│       ├── hooks/
│       │   └── useWebRTC.js     # WebRTC peer connections
│       ├── pages/
│       │   ├── AuthPage.js      # Login / Register UI
│       │   ├── HomePage.js      # Lobby (create/join room)
│       │   └── RoomPage.js      # Main conferencing UI
│       └── components/
│           ├── VideoTile.js     # Individual video feed
│           ├── ChatPanel.js     # Chat + file sharing UI
│           └── Whiteboard.js    # Collaborative drawing
│
└── package.json             # Root scripts (concurrently)
```

---

## Setup & Run

### Prerequisites
- Node.js v16+
- npm v8+

### 1. Clone / Extract the project
```bash
cd syncroom
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Start both server and client
```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

---

## Demo Credentials

| Username | Password |
|---|---|
| `demo` | `demo123` |
| `anil` | `anil123` |

Or register a new account directly in the app.

---

## How It Works

### Authentication Flow
1. User registers/logs in → server returns **JWT token**
2. Token stored in `localStorage`
3. Every API request + Socket.io connection authenticated via JWT

### WebRTC Video Call Flow
1. User A joins room → emits `room:join`
2. Server notifies User B → `room:user-joined`
3. User B creates `RTCPeerConnection` → sends **offer**
4. User A receives offer → sends **answer**
5. ICE candidates exchanged → P2P connection established
6. Video/audio streams flow **peer-to-peer** (not through server)

### Socket.io Events
| Event | Direction | Purpose |
|---|---|---|
| `room:join` | Client→Server | Join a room |
| `room:joined` | Server→Client | Room state on join |
| `room:user-joined` | Server→Client | New user notification |
| `webrtc:offer/answer/ice-candidate` | Client↔Client | WebRTC signaling |
| `media:toggle` | Client→Room | Mute/camera state |
| `screen:start/stop` | Client→Room | Screen share events |
| `chat:message` | Client↔Room | Text messages |
| `file:share` | Client→Room | File transfer |
| `whiteboard:draw/clear/undo` | Client↔Room | Drawing sync |

---

##  Security Features
- **JWT Authentication** — all routes and socket connections protected
- **bcrypt password hashing** — 12 salt rounds
- **CORS configuration** — restricted to client origin
- **File size limits** — max 10MB per file
- **Token expiry** — 24 hour JWT lifetime

---

## Technologies Used

**Frontend:**
- React 18, Context API, Custom Hooks
- WebRTC (native browser API)
- Socket.io-client
- HTML5 Canvas (whiteboard)

**Backend:**
- Node.js + Express
- Socket.io (WebSocket server)
- JWT (jsonwebtoken) + bcryptjs
- Multer (file uploads)

---

