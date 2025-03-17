const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Users storage
const users = {};
const activeUsers = new Set();

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/games', express.static(path.join(__dirname, 'games')));

// Serve main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Authentication handler
  socket.on('authenticate', (user) => {
    users[socket.id] = user;
    activeUsers.add(user.username);
    
    // Send user list to all clients
    io.emit('user list', Array.from(activeUsers));
    
    // Notify others
    socket.broadcast.emit('user joined', user.username);
  });

  // Private message handler
  socket.on('private message', ({ recipient, text }) => {
    const recipientSocket = findSocketByUsername(recipient);
    
    if (recipientSocket) {
      io.to(recipientSocket).emit('private message', {
        sender: users[socket.id].username,
        text,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      activeUsers.delete(users[socket.id].username);
      delete users[socket.id];
      
      // Update user list for all clients
      io.emit('user list', Array.from(activeUsers));
    }
  });
});

// Helper function to find user sockets
function findSocketByUsername(username) {
  const userEntry = Object.entries(users).find(
    ([id, user]) => user.username === username
  );
  
  return userEntry ? userEntry[0] : null;
}

// Error handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public/html/404.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});