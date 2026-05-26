const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('user connected:', socket.id);

    // join a project room
    socket.on('join_project', (projectId) => {
      socket.join(projectId);
      console.log(`user ${socket.id} joined project ${projectId}`);
    });

    // leave a project room
    socket.on('leave_project', (projectId) => {
      socket.leave(projectId);
      console.log(`user ${socket.id} left project ${projectId}`);
    });

    // task created
    socket.on('task_created', (data) => {
      socket.to(data.projectId).emit('task_created', data.task);
    });

    // task updated
    socket.on('task_updated', (data) => {
      socket.to(data.projectId).emit('task_updated', data.task);
    });

    // task deleted
    socket.on('task_deleted', (data) => {
      socket.to(data.projectId).emit('task_deleted', data.taskId);
    });

    // comment added
    socket.on('comment_added', (data) => {
      socket.to(data.projectId).emit('comment_added', data.comment);
    });

    // notification
    socket.on('send_notification', (data) => {
      socket.to(data.projectId).emit('notification', {
        message: data.message,
        type: data.type,
      });
    });

    // disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;