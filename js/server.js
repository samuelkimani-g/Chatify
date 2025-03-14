// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/games', express.static(path.join(__dirname, 'games')));

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Socket.IO chat handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming chat messages
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Broadcast to all clients
  });

  // Handle game state updates
  socket.on('game update', (state) => {
    io.emit('game update', state);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'html', '404.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});