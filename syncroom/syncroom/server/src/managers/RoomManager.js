class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  joinRoom(roomId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { id: roomId, users: new Map(), createdAt: new Date() });
    }
    const room = this.rooms.get(roomId);
    room.users.set(user.socketId, user);
    return this.serialize(room);
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.users.delete(socketId);
    if (room.users.size === 0) this.rooms.delete(roomId);
  }

  getRoom(roomId) {
    const room = this.rooms.get(roomId);
    return room ? this.serialize(room) : null;
  }

  serialize(room) {
    return { id: room.id, users: Array.from(room.users.values()), createdAt: room.createdAt };
  }
}

module.exports = RoomManager;
