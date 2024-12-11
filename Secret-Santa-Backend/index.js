const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const gameRoutes = require('./routes/GameRoute.js');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/WishlistRoute');
const messageRoutes = require('./routes/messageRoutes');

const { initializeSocketServer } = require('./service/SocketService');
const { Server } = require('socket.io');
require('./service/SchedulerService.js');

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5002;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use(gameRoutes);
app.use(authRoutes);
app.use(messageRoutes);
app.use(wishlistRoutes);

// Initialize the WebSocket server (passing the same HTTP server for WebSocket functionality)
initializeSocketServer(server); // Use the same server instance here

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
