const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('New user:', socket.id);

  if (waitingPlayer) {
    const room = `room-${Date.now()}`;
    socket.join(room);
    waitingPlayer.join(room);
    io.to(room).emit('start_game', { room });
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
  }

  socket.on('player_move', ({ room, move }) => {
    socket.to(room).emit('opponent_move', move);
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket) waitingPlayer = null;
  });
});

server.listen(3000, () => console.log('Socket.io server ready on port 3000'));
