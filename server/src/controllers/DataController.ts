import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";

// Correctly import and extend Express types
import 'express';

// Properly extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Create Announcement Schema if it doesn't exist yet
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, default: "normal" },
  author: { type: String, required: true },
  date: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../public/uploads/announcements");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `announcement-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("image");


export const CREATE_ANNOUCEMENT = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  console.log("IN THE CREATE_ANNOUCEMENT CONTROLLER");

  
  upload(request, response, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error("Multer error:", err);
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    } else if (err) {
      // An unknown error occurred when uploading
      console.error("Unknown upload error:", err);
      response.status(500).json({ message: `Unknown upload error: ${err.message}` });
      return;
    }
    
    try {
      const { title, content, category, priority, author, date } = request.body;
      
      // Validation
      if (!title || !content || !author) {
        response.status(400).json({ message: "Missing required fields" });
        return;
      }
      
      let imageUrl = request.body.imageUrl; // Default URL if provided
      
      // If file was uploaded, use its path
      if (request.file) {
        // Create URL path for the uploaded image
        imageUrl = `/uploads/announcements/${request.file.filename}`;
      }
      
      if (!imageUrl) {
        response.status(400).json({ message: "Image is required" });
        return;
      }
      
      // Create the announcement in the database
      const announcement = await Announcement.create({
        title,
        content,
        category,
        priority,
        author,
        date,
        imageUrl
      });
      
      response.status(201).json({
        message: "Announcement created successfully",
        announcement
      });
      console.log(request.body);
      console.log(request.file);
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      response.status(500).json({ 
        message: "Failed to create announcement",
        error: error.message
      });
    }
  });
};


export const FETCH_USER_INFO = async ( request: Request, response: Response,  next: NextFunction): Promise<void> => {
  try {
    console.log("IN THE FETCH_USER_INFO CONTROLLER");
    const { userId } = request.query;
    const trimmedUserId = (userId as string)?.trim();
    // console.log(trimmedUserId);

    if (!trimmedUserId) {
      response.status(400).json({ error: "Missing or invalid userId" });
      return;
    }

    // Check teacher collection using clerkUserId
    const teacher = await TeacherSchema.findOne({ clerkUserId: trimmedUserId });
    if (teacher) {
      response.status(200).json({ role: "teacher", data: teacher });
      return;
    }

    // Check student collection using clerkUserId
    const student = await StudentSchema.findOne({ clerkUserId: trimmedUserId });
    if (student) {
      response.status(200).json({ role: "student", data: student });
      return;
    }

    // Not found in either collection
    response.status(404).json({ error: "User not found in the database" });
  } catch (error) {
    next(error);
  }
};