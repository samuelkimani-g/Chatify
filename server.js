require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Secure password storage
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key_here';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('html')); // Serve static files from the html folder
app.use(express.static('public'));
app.use('/videos', express.static('videos')); // Serve video files

let users = []; // Temporary storage (Replace with DB later)

// Signup API
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ error: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash password before storing
        const user = { id: Date.now(), name, email, password: hashedPassword };
        users.push(user);

        const token = jwt.sign({ id: user.id, email, name }, SECRET_KEY, { expiresIn: '1h' });

        res.status(201).json({ message: "Signup successful!", token, user: { id: user.id, name, email } });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login API
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Authentication Check API
app.get('/api/auth/check', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ authenticated: true, user: decoded });
    } catch (err) {
        res.status(403).json({ error: "Invalid token" });
    }
});

// Get Users API
app.get('/api/users', (req, res) => {
    res.json(users.map(user => ({ id: user.id, name: user.name, email: user.email }))); // Hide passwords
});

// WebSocket Handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('private message', ({ senderId, receiverId, message }) => {
        const recipientSocket = Array.from(io.sockets.sockets.values()).find(s => s.id === receiverId);
        if (recipientSocket) {
            recipientSocket.emit('private message', { senderId, message });
        }
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
server.listen(PORT, () => console.log(`🔥 Server running on http://localhost:${PORT}`));
