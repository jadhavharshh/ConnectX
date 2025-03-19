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

// Create Task Schema for storing tasks
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  priority: { type: String, default: "normal" },
  dueDate: { type: String },
  points: { type: String, required: true },
  assignedYear: { type: String, default: "None" },
  assignedDivision: { type: String, default: "None" },
  attachmentUrl: { type: String },
  attachmentName: { type: String },
  createdDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", AnnouncementSchema);
const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// Configure multer storage
const announcementStorage = multer.diskStorage({
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

const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../public/uploads/tasks");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `task-${uniqueSuffix}${ext}`);
  }
});


const announcementFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const taskFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow various file types for task attachments
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Supported files: PDF, DOCX, XLSX, Images"));
  }
};

const uploadAnnouncement = multer({
  storage: announcementStorage,
  fileFilter: announcementFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("image");

const uploadTaskAttachment = multer({
  storage: taskStorage,
  fileFilter: taskFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
}).single("attachment");


export const CREATE_ANNOUCEMENT = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  console.log("IN THE CREATE_ANNOUCEMENT CONTROLLER");


  uploadAnnouncement(request, response, async (err) => {
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
      // Inside the CREATE_ANNOUCEMENT function
      if (request.file) {
        // Create URL path for the uploaded image
        imageUrl = `${request.protocol}://${request.get('host')}/uploads/announcements/${request.file.filename}`;
      }
      console.log("THIS IS THE IMAGE URL")
      console.log(imageUrl);

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


export const FETCH_USER_INFO = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
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


// Add this function to your existing DataController.ts file

export const FETCH_ANNOUNCEMENTS = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("IN THE FETCH_ANNOUNCEMENTS CONTROLLER");

    // Get announcements from the database, sorted by newest first
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });

    response.status(200).json({
      message: "Announcements fetched successfully",
      announcements
    });

  } catch (error: any) {
    console.error("Error fetching announcements:", error);
    response.status(500).json({
      message: "Failed to fetch announcements",
      error: error.message
    });
  }
};

// New CREATE_TASK function 
export const CREATE_TASK = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  console.log("IN THE CREATE_TASK CONTROLLER");
  
  uploadTaskAttachment(request, response, async (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    } else if (err) {
      console.error("Unknown upload error:", err);
      response.status(500).json({ message: `Unknown upload error: ${err.message}` });
      return;
    }
    
    try {
      const { 
        title, 
        description, 
        subject, 
        priority, 
        dueDate, 
        points, 
        assignedYear, 
        assignedDivision,
        createdDate
      } = request.body;
      
      // Validation for required fields
      if (!title || !description) {
        response.status(400).json({ message: "Missing required fields" });
        return;
      }
      
      // Create task object
      const taskData: any = {
        title,
        description,
        subject,
        priority,
        dueDate,
        points,
        assignedYear,
        assignedDivision,
        createdDate
      };
      
      // If file was uploaded, add its path
      if (request.file) {
        const attachmentUrl = `${request.protocol}://${request.get('host')}/uploads/tasks/${request.file.filename}`;
        taskData.attachmentUrl = attachmentUrl;
        taskData.attachmentName = request.file.originalname;
      }
      
      // Create the task in the database
      const task = await Task.create(taskData);
      
      response.status(201).json({
        message: "Task created successfully",
        task
      });
      
      console.log("Task created:", task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      response.status(500).json({
        message: "Failed to create task",
        error: error.message
      });
    }
  });
};

// Add FETCH_TASKS function to get all tasks
export const FETCH_TASKS = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("IN THE FETCH_TASKS CONTROLLER");
    
    // Get tasks from the database, sorted by newest first
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    
    response.status(200).json({
      message: "Tasks fetched successfully",
      tasks
    });
    
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    response.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};