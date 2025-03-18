require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key_here';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('html')); // Serve static files from the html folder

let users = []; // Temporary storage (Replace with DB later)

// ✅ Signup API
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const token = jwt.sign({ name, email }, SECRET_KEY, { expiresIn: '1h' });
    users.push({ name, email, password });
    res.json({ token });
});

// ✅ Login API
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const token = jwt.sign({ email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// ✅ Authentication Check API
app.get('/api/auth/check', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        res.json({ message: 'Authenticated', user });
    });
});

// ✅ Get Users API
app.get('/api/users', (req, res) => {
    res.json(users);
});

// ✅ WebSocket Handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('private message', (data) => {
        io.emit('private message', data); // Broadcast message
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));
