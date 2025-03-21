import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import http from 'http'; // Add this
import { Server } from 'socket.io'; // Add this
import AuthRoutes from './Routes/AuthRoutes';
import DataRoutes from './Routes/DataRoutes';
import ChatRoutes from './Routes/ChatRoutes';
import path from 'path';
import ChatMessageModel from './models/ChatSchema';

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {  // Set up Socket.IO
  cors: {
    origin: process.env.ORIGIN || "http://localhost:5173",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;
const origin = process.env.ORIGIN || "http://localhost:5173";

// Middleware for CORS
app.use(cors({
    origin: origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use("/api/auth", AuthRoutes);
app.use("/api/data", DataRoutes);
app.use("/api/chat", ChatRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});
// Socket.IO setup


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

socket.on('send_message', async (data) => {
  try {
    const { receiverId, content } = data;
    const senderId = socket.data.userId;
    
    console.log(`Attempting to send message: ${senderId} -> ${receiverId}`);
    
    if (!senderId || !receiverId || !content) {
      console.log('Invalid message data:', { senderId, receiverId, content });
      return socket.emit('error', 'Invalid message data');
    }
    
    // Create and save the message to MongoDB
    const newMessage = new ChatMessageModel({
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false
    });
    
    const savedMessage = await newMessage.save();
    
    // Emit to the sender
    socket.emit('message_sent', savedMessage);
    
    // Check if receiver is connected
    const receiverSocketIds = await io.in(receiverId).allSockets();
    console.log(`Receiver ${receiverId} connected sockets:`, receiverSocketIds.size);
    
    // Emit to the receiver if they're online
    io.to(receiverId).emit('new_message', savedMessage);
    console.log(`Message emitted to receiver ${receiverId}`);
    
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', 'Failed to send message');
  }
});

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
  socket.on('mark_as_read', async (data) => {
    try {
      const { messageIds } = data;
      
      if (!messageIds || !Array.isArray(messageIds)) {
        return socket.emit('error', 'Invalid message IDs');
      }
      
      await ChatMessageModel.updateMany(
        { _id: { $in: messageIds } },
        { $set: { read: true } }
      );
      
      socket.emit('messages_marked_read', messageIds);
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', 'Failed to mark messages as read');
    }
  });
  
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

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log('Database connected');
    server.listen(port, () => { // Use the HTTP server instead of app
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });