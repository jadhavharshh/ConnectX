import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import AuthRoutes from './Routes/AuthRoutes';
import DataRoutes from './Routes/DataRoutes';
import path from 'path';

dotenv.config();

const app = express();
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

app.get('/', (req, res) => {
    res.send('Server is running');
});


// Connect to the database and then start the server
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(DATABASE_URL)
  .then(() => {
    console.log('Database connected');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });