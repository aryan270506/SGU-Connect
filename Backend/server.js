const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { database } = require('../Screens/firebase');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const activeRooms = new Map();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Join classroom channel
  socket.on('join-classroom', ({ year, division }) => {
    const roomId = `class-${year}-${division}`;
    socket.join(roomId);
    activeRooms.set(socket.id, roomId);
    console.log(`${socket.id} joined ${roomId}`);
  });

  // Handle teacher messages
  socket.on('teacher-message', ({ message, year, division }) => {
    const roomId = `class-${year}-${division}`;
    const msgData = {
      id: Date.now(),
      text: message,
      timestamp: new Date().toISOString(),
      isTeacher: true
    };

    // Emit message to other clients in the room
    socket.to(roomId).emit('new-message', msgData);

    // Store message in Firebase Realtime Database
    const messageRef = database.ref(`messages/${roomId}`).push();
    messageRef.set(msgData)
      .then(() => console.log(`Message stored in Firebase under ${roomId}`))
      .catch((error) => console.error('Error storing message:', error));
  });

  socket.on('disconnect', () => {
    const roomId = activeRooms.get(socket.id);
    console.log(`${socket.id} disconnected from ${roomId}`);
    activeRooms.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
