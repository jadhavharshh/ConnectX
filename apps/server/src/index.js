"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKeepAlive = startKeepAlive;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http")); // Add this
const socket_io_1 = require("socket.io"); // Add this
const AuthRoutes_1 = __importDefault(require("./Routes/AuthRoutes"));
const DataRoutes_1 = __importDefault(require("./Routes/DataRoutes"));
const ChatRoutes_1 = __importDefault(require("./Routes/ChatRoutes"));
const CourseRoutes_1 = __importDefault(require("./Routes/CourseRoutes"));
const path_1 = __importDefault(require("path"));
const ChatSchema_1 = __importDefault(require("./models/ChatSchema"));
const MenteeRoutes_1 = __importDefault(require("./Routes/MenteeRoutes"));
const MentorRoutes_1 = __importDefault(require("./Routes/MentorRoutes"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app); // Create HTTP server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.ORIGIN || "http://localhost:5173",
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const uploadDir = path_1.default.join(__dirname, '../public/uploads/documents');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
const port = process.env.PORT || 5001;
const DATABASE_URL = process.env.DATABASE_URL;
const origin = process.env.ORIGIN || "http://localhost:5173";
// Middleware for CORS
app.use((0, cors_1.default)({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
app.use("/api/auth", AuthRoutes_1.default);
app.use("/api/data", DataRoutes_1.default);
app.use("/api/chat", ChatRoutes_1.default);
app.use("/api/courses", CourseRoutes_1.default);
app.use("/api/mentor", MentorRoutes_1.default);
app.use("/api/mentee", MenteeRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Server is running');
});
// Socket.IO setup
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
function startKeepAlive(serverUrl) {
    // Function to perform a health check ping
    const performHealthCheck = () => {
        console.log("SMTP host:", process.env.SMTP_HOST);
        console.log(`[${new Date().toISOString()}] Server self-ping to prevent inactivity shutdown`);
        fetch(`${serverUrl}/health`)
            .then(response => response.text())
            .then(data => console.log(`Health check response: ${data}`))
            .catch(err => console.error('Error during self-ping:', err));
        // Calculate next ping time (between 7-13 minutes)
        const minInterval = 7 * 60 * 1000; // 7 minutes in ms
        const maxInterval = 13 * 60 * 1000; // 13 minutes in ms
        const nextInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
        // Schedule next ping
        setTimeout(performHealthCheck, nextInterval);
        console.log(`Next ping scheduled in ${(nextInterval / 60000).toFixed(1)} minutes`);
    };
    // Start the first ping
    const initialInterval = Math.floor(Math.random() * (13 - 7 + 1) + 7) * 60 * 1000;
    setTimeout(performHealthCheck, initialInterval);
    console.log(`Keep-alive service started, first ping in ${(initialInterval / 60000).toFixed(1)} minutes`);
}
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // User authentication
    socket.on('authenticate', (userId) => {
        if (!userId) {
            return socket.emit('error', 'No user ID provided');
        }
        // Associate this socket with a user ID
        socket.data.userId = userId;
        socket.join(userId); // Join a room with the user's ID
        console.log(`User ${userId} authenticated`);
    });
    // In the socket.on('send_message') handler:
    socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { receiverId, content } = data;
            const senderId = socket.data.userId;
            console.log(`Attempting to send message: ${senderId} -> ${receiverId}`);
            if (!senderId || !receiverId || !content) {
                console.log('Invalid message data:', { senderId, receiverId, content });
                return socket.emit('error', 'Invalid message data');
            }
            // Create and save the message to MongoDB
            const newMessage = new ChatSchema_1.default({
                senderId,
                receiverId,
                content,
                timestamp: new Date(),
                read: false
            });
            const savedMessage = yield newMessage.save();
            // Emit to the sender
            socket.emit('message_sent', savedMessage);
            // Check if receiver is connected
            const receiverSocketIds = yield io.in(receiverId).allSockets();
            console.log(`Receiver ${receiverId} connected sockets:`, receiverSocketIds.size);
            // Emit to the receiver if they're online
            io.to(receiverId).emit('new_message', savedMessage);
            console.log(`Message emitted to receiver ${receiverId}`);
        }
        catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', 'Failed to send message');
        }
    }));
    // Update the authenticate handler:
    socket.on('authenticate', (userId) => {
        if (!userId) {
            console.log('Authentication failed: No userId provided');
            return socket.emit('error', 'No user ID provided');
        }
        // Associate this socket with a user ID
        socket.data.userId = userId;
        // Leave any previous rooms
        for (const room of socket.rooms) {
            if (room !== socket.id) { // Don't leave the default room
                socket.leave(room);
            }
        }
        // Join a room with the user's ID
        socket.join(userId);
        console.log(`User ${userId} authenticated and joined room ${userId}`);
        // Confirm authentication to client
        socket.emit('authenticated', { userId });
    });
    // Mark messages as read
    socket.on('mark_as_read', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { messageIds } = data;
            if (!messageIds || !Array.isArray(messageIds)) {
                return socket.emit('error', 'Invalid message IDs');
            }
            yield ChatSchema_1.default.updateMany({ _id: { $in: messageIds } }, { $set: { read: true } });
            socket.emit('messages_marked_read', messageIds);
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
            socket.emit('error', 'Failed to mark messages as read');
        }
    }));
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
// Connect to the database and then start the server
if (!DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables.");
    process.exit(1);
}
mongoose_1.default.connect(DATABASE_URL)
    .then(() => {
    console.log('Database connected');
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        startKeepAlive('https://connectx-node-backend.onrender.com');
    });
})
    .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
});
