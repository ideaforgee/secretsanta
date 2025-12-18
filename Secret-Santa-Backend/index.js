const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const secretSantaRoutes = require('./routes/SecretSantaRoute.js');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/WishlistRoute');
const messageRoutes = require('./routes/messageRoutes');
const masterMindRoutes = require('./routes/MasterMindRoute.js');
const tambolaRoutes = require('./routes/TambolaRoute.js');
const groupRoutes = require('./routes/GroupRoutes.js');
const notificationRoutes = require('./routes/NotificationRoutes');

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
app.use(secretSantaRoutes);
app.use(authRoutes);
app.use(messageRoutes);
app.use(wishlistRoutes);
app.use(masterMindRoutes);
app.use(tambolaRoutes);
app.use(groupRoutes);
app.use(notificationRoutes);

// Initialize the WebSocket server (passing the same HTTP server for WebSocket functionality)
initializeSocketServer(server); // Use the same server instance here

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
