import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Define the schemas directly in this file as well to ensure they exist
const MentorMenteeSchema = new mongoose.Schema({
  mentorId: { type: String, required: true },
  studentId: { type: String, required: true },
  assignedDate: { type: Date, default: Date.now }
});

const DocumentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
  url: { type: String, required: true },
  categoryId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  }
});

const DocumentCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  description: { type: String, required: true }
});

// Initialize models (making sure they exist)
const MentorMentee = mongoose.models.MentorMentee || mongoose.model("MentorMentee", MentorMenteeSchema);
const Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema);
const DocumentCategory = mongoose.models.DocumentCategory || mongoose.model("DocumentCategory", DocumentCategorySchema);

// Configure multer storage for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/documents');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'document-' + uniqueSuffix + extension);
  }
});

// Define the multer middleware for document uploads
const uploadDocument = multer({ storage: documentStorage }).single('document');

/**
 * Fetch mentor assigned to a specific student
 */
export const FETCH_MENTOR = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("In the FETCH_MENTOR function");
    const { studentId } = request.query;
    
    if (!studentId) {
      response.status(400).json({ error: "Student ID is required" });
      return;
    }

    // Find the mentor-mentee relationship for this student
    const mentorship = await MentorMentee.findOne({ studentId });
    
    if (!mentorship) {
      response.status(200).json({ mentor: null });
      return;
    }

    // Find the mentor
    const mentor = await TeacherSchema.findOne({ clerkUserId: mentorship.mentorId });
    
    if (!mentor) {
      response.status(200).json({ mentor: null });
      return;
    }

    response.status(200).json({ 
      mentor: {
        id: mentor.clerkUserId,
        name: mentor.name,
        email: mentor.teacherId,
        department: mentor.department
      }
    });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    response.status(500).json({ error: "Failed to fetch mentor" });
  }
};

// Rest of your controller functions...

/**
 * Fetch document categories
 */
export const FETCH_DOCUMENT_CATEGORIES = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the FETCH_DOCUMENT_CATEGORIES function");
  try {
    // If no categories exist yet, create some default ones
    const categoryCount = await DocumentCategory.countDocuments();
    
    if (categoryCount === 0) {
      // Create default categories
      await DocumentCategory.insertMany([
        {
          name: "Academic Marksheets",
          required: true,
          description: "Semester-wise marksheets and grade reports"
        },
        {
          name: "Certificates",
          required: false,
          description: "Course completion, internship, and other certificates"
        },
        {
          name: "ID Proofs",
          required: true,
          description: "College ID card and other identity proofs"
        },
        {
          name: "Projects",
          required: false,
          description: "Project reports and documentation"
        }
      ]);
    }

    const categories = await DocumentCategory.find();
    
    response.status(200).json({ 
      categories: categories.map(category => ({
        id: category._id,
        name: category.name,
        required: category.required,
        description: category.description
      }))
    });
  } catch (error) {
    console.error("Error fetching document categories:", error);
    response.status(500).json({ error: "Failed to fetch document categories" });
  }
};

/**
 * Fetch documents for a specific student
 */
export const FETCH_DOCUMENTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the FETCH_DOCUMENTS function");
  try {
    const { studentId } = request.query;
    
    if (!studentId) {
      response.status(400).json({ error: "Student ID is required" });
      return;
    }

    // Fetch the student's documents
    const documents = await Document.find({ studentId });
    
    response.status(200).json({ 
      documents: documents.map(doc => ({
        id: doc._id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadDate: doc.uploadDate,
        url: doc.url,
        status: doc.status
      }))
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    response.status(500).json({ error: "Failed to fetch documents" });
  }
};

/**
 * Upload a new document
 */
export const UPLOAD_DOCUMENT = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the UPLOAD_DOCUMENT function");
  uploadDocument(request, response, async (err) => {
    if (err instanceof multer.MulterError) {
      return response.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return response.status(500).json({ message: `Unknown upload error: ${err.message}` });
    }
    
    try {
      const { documentName, categoryId, studentId } = request.body;
      
      if (!documentName || !categoryId || !studentId || !request.file) {
        response.status(400).json({ message: "Missing required fields" });
        return;
      }
      
      // Get the file details
      const file = request.file;
      const fileUrl = `${request.protocol}://${request.get('host')}/uploads/documents/${file.filename}`;
      
      // Create the document record
      const newDocument = await Document.create({
        studentId,
        name: documentName,
        type: path.extname(file.originalname).substring(1).toUpperCase(),
        size: file.size,
        url: fileUrl,
        categoryId,
        status: "pending"
      });
      
      response.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        document: {
          id: newDocument._id,
          name: newDocument.name,
          type: newDocument.type,
          size: newDocument.size,
          uploadDate: newDocument.uploadDate,
          url: newDocument.url,
          status: newDocument.status
        }
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      response.status(500).json({ message: "Failed to upload document" });
    }
  });
};

/**
 * Delete a document
 */
export const DELETE_DOCUMENT = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the DELETE_DOCUMENT function");
  try {
    const { documentId } = request.body;
    
    if (!documentId) {
      response.status(400).json({ message: "Document ID is required" });
      return;
    }
    
    // Find the document first to get the file URL
    const document = await Document.findById(documentId);
    
    if (!document) {
      response.status(404).json({ message: "Document not found" });
      return;
    }
    
    // Delete the document from the database
    await Document.findByIdAndDelete(documentId);
    
    // Try to delete the physical file if possible
    try {
      const urlParts = document.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filePath = path.join(__dirname, '../../public/uploads/documents', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileError) {
      console.error("Error deleting file:", fileError);
      // Continue execution even if file deletion fails
    }
    
    response.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    response.status(500).json({ message: "Failed to delete document" });
  }
};