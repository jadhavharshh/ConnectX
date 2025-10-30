import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create MentorMentee relationship schema
const MentorMenteeSchema = new mongoose.Schema({
  mentorId: { type: String, required: true },
  studentId: { type: String, required: true },
  assignedDate: { type: Date, default: Date.now }
});

// Create Document schema for student document uploads
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

// Create DocumentCategory schema for document types
const DocumentCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  description: { type: String, required: true }
});

// Initialize models (if they don't exist)
const MentorMentee = mongoose.models.MentorMentee || mongoose.model("MentorMentee", MentorMenteeSchema);
const Document = mongoose.models.Document || mongoose.model("Document", DocumentSchema);
const DocumentCategory = mongoose.models.DocumentCategory || mongoose.model("DocumentCategory", DocumentCategorySchema);

/**
 * Fetch all mentees assigned to a specific mentor
 */
export const FETCH_MENTEES = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("In FETCH_MENTEES function");
    const { mentorId } = request.query;

    if (!mentorId) {
      response.status(400).json({ error: "Mentor ID is required" });
      return;
    }

    // Find all mentor-mentee relationships for this mentor
    const mentorships = await MentorMentee.find({ mentorId });
    console.log(`Found ${mentorships.length} mentorships for mentor ${mentorId}`);

    if (!mentorships || mentorships.length === 0) {
      response.status(200).json({ mentees: [] });
      return;
    }

    // Get all student IDs from these relationships
    const studentIds = mentorships.map(mentorship => mentorship.studentId);

    // Find all students with these IDs
    const students = await StudentSchema.find({ clerkUserId: { $in: studentIds } });
    console.log(`Found ${students.length} students from mentorships`);

    // Get documents for each student
    const menteePromises = students.map(async (student) => {
      // Fetch documents for this student
      const documents = await Document.find({ studentId: student.clerkUserId });
      console.log(`Found ${documents.length} documents for student ${student.name}`);

      return {
        id: student.clerkUserId,
        name: student.name,
        email: student.email || student.studentId,
        studentId: student.studentId,
        year: student.year || "first",
        division: student.division || "A",
        documents: documents.map(doc => ({
          id: doc._id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadDate: doc.uploadDate,
          url: doc.url,
          status: doc.status
        }))
      };
    });

    const mentees = await Promise.all(menteePromises);
    response.status(200).json({ mentees });

  } catch (error) {
    console.error("Error fetching mentees:", error);
    response.status(500).json({ error: "Failed to fetch mentees" });
  }
};

/**
 * Add students as mentees to a mentor
 */
export const FETCH_ALL_STUDENTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the FETCH_ALL_STUDENTS function");
  try {
    // Simply fetch all students from the database
    const students = await StudentSchema.find({});

    // Transform the data for the frontend
    const studentsList = students.map(student => ({
      id: student.clerkUserId,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      year: student.year,
      division: student.division
    }));

    response.status(200).json({ students: studentsList });
  } catch (error) {
    console.error("Error fetching students:", error);
    response.status(500).json({ error: "Failed to fetch students" });
  }
};

/**
 * Add students as mentees to a mentor - simplified version
 */
export const ADD_MENTEES = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("In the ADD_MENTEES function");
    const { mentorId, studentIds } = request.body;

    if (!mentorId || !studentIds || !Array.isArray(studentIds)) {
      response.status(400).json({ error: "Mentor ID and student IDs are required" });
      return;
    }

    // Create new mentor-mentee relationships
    const mentorships = studentIds.map(studentId => ({
      mentorId,
      studentId,
      assignedDate: new Date()
    }));

    // Remove any existing relationships for these students to avoid duplicates
    await MentorMentee.deleteMany({
      studentId: { $in: studentIds },
      mentorId: mentorId
    });

    // Insert the new relationships
    await MentorMentee.insertMany(mentorships);

    response.status(200).json({
      success: true,
      message: `Added ${studentIds.length} mentees to mentor`
    });
  } catch (error) {
    console.error("Error adding mentees:", error);
    response.status(500).json({ error: "Failed to add mentees" });
  }
};

/**
 * Fetch documents for a specific mentee
 */
export const FETCH_MENTEE_DOCUMENTS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  console.log("In the FETCH_MENTEE_DOCUMENTS function");
  try {
    const { mentorId, studentId } = request.query;

    if (!mentorId || !studentId) {
      response.status(400).json({ error: "Mentor ID and student ID are required" });
      return;
    }

    // Verify the mentor-mentee relationship
    const mentorship = await MentorMentee.findOne({ mentorId, studentId });
    if (!mentorship) {
      response.status(403).json({ error: "This student is not your mentee" });
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
    console.error("Error fetching mentee documents:", error);
    response.status(500).json({ error: "Failed to fetch mentee documents" });
  }
};

export const UPDATE_DOCUMENT_STATUS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { documentId, status } = request.body;
    
    if (!documentId || !status || !["approved", "rejected"].includes(status)) {
      response.status(400).json({ error: "Document ID and valid status are required" });
      return;
    }
    
    // Update the document status
    await Document.findByIdAndUpdate(documentId, { status });
    
    response.status(200).json({ 
      success: true, 
      message: `Document status updated to ${status}` 
    });
  } catch (error) {
    console.error("Error updating document status:", error);
    response.status(500).json({ error: "Failed to update document status" });
  }
};