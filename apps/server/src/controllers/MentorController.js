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
exports.UPDATE_DOCUMENT_STATUS = exports.FETCH_MENTEE_DOCUMENTS = exports.ADD_MENTEES = exports.FETCH_ALL_STUDENTS = exports.FETCH_MENTEES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const StudentSchema_1 = __importDefault(require("../models/StudentSchema"));
// Create MentorMentee relationship schema
const MentorMenteeSchema = new mongoose_1.default.Schema({
    mentorId: { type: String, required: true },
    studentId: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now }
});
// Create Document schema for student document uploads
const DocumentSchema = new mongoose_1.default.Schema({
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
const DocumentCategorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    description: { type: String, required: true }
});
// Initialize models (if they don't exist)
const MentorMentee = mongoose_1.default.models.MentorMentee || mongoose_1.default.model("MentorMentee", MentorMenteeSchema);
const Document = mongoose_1.default.models.Document || mongoose_1.default.model("Document", DocumentSchema);
const DocumentCategory = mongoose_1.default.models.DocumentCategory || mongoose_1.default.model("DocumentCategory", DocumentCategorySchema);
/**
 * Fetch all mentees assigned to a specific mentor
 */
const FETCH_MENTEES = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("In FETCH_MENTEES function");
        const { mentorId } = request.query;
        if (!mentorId) {
            response.status(400).json({ error: "Mentor ID is required" });
            return;
        }
        // Find all mentor-mentee relationships for this mentor
        const mentorships = yield MentorMentee.find({ mentorId });
        console.log(`Found ${mentorships.length} mentorships for mentor ${mentorId}`);
        if (!mentorships || mentorships.length === 0) {
            response.status(200).json({ mentees: [] });
            return;
        }
        // Get all student IDs from these relationships
        const studentIds = mentorships.map(mentorship => mentorship.studentId);
        // Find all students with these IDs
        const students = yield StudentSchema_1.default.find({ clerkUserId: { $in: studentIds } });
        console.log(`Found ${students.length} students from mentorships`);
        // Get documents for each student
        const menteePromises = students.map((student) => __awaiter(void 0, void 0, void 0, function* () {
            // Fetch documents for this student
            const documents = yield Document.find({ studentId: student.clerkUserId });
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
        }));
        const mentees = yield Promise.all(menteePromises);
        response.status(200).json({ mentees });
    }
    catch (error) {
        console.error("Error fetching mentees:", error);
        response.status(500).json({ error: "Failed to fetch mentees" });
    }
});
exports.FETCH_MENTEES = FETCH_MENTEES;
/**
 * Add students as mentees to a mentor
 */
const FETCH_ALL_STUDENTS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the FETCH_ALL_STUDENTS function");
    try {
        // Simply fetch all students from the database
        const students = yield StudentSchema_1.default.find({});
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
    }
    catch (error) {
        console.error("Error fetching students:", error);
        response.status(500).json({ error: "Failed to fetch students" });
    }
});
exports.FETCH_ALL_STUDENTS = FETCH_ALL_STUDENTS;
/**
 * Add students as mentees to a mentor - simplified version
 */
const ADD_MENTEES = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield MentorMentee.deleteMany({
            studentId: { $in: studentIds },
            mentorId: mentorId
        });
        // Insert the new relationships
        yield MentorMentee.insertMany(mentorships);
        response.status(200).json({
            success: true,
            message: `Added ${studentIds.length} mentees to mentor`
        });
    }
    catch (error) {
        console.error("Error adding mentees:", error);
        response.status(500).json({ error: "Failed to add mentees" });
    }
});
exports.ADD_MENTEES = ADD_MENTEES;
/**
 * Fetch documents for a specific mentee
 */
const FETCH_MENTEE_DOCUMENTS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the FETCH_MENTEE_DOCUMENTS function");
    try {
        const { mentorId, studentId } = request.query;
        if (!mentorId || !studentId) {
            response.status(400).json({ error: "Mentor ID and student ID are required" });
            return;
        }
        // Verify the mentor-mentee relationship
        const mentorship = yield MentorMentee.findOne({ mentorId, studentId });
        if (!mentorship) {
            response.status(403).json({ error: "This student is not your mentee" });
            return;
        }
        // Fetch the student's documents
        const documents = yield Document.find({ studentId });
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
    }
    catch (error) {
        console.error("Error fetching mentee documents:", error);
        response.status(500).json({ error: "Failed to fetch mentee documents" });
    }
});
exports.FETCH_MENTEE_DOCUMENTS = FETCH_MENTEE_DOCUMENTS;
const UPDATE_DOCUMENT_STATUS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentId, status } = request.body;
        if (!documentId || !status || !["approved", "rejected"].includes(status)) {
            response.status(400).json({ error: "Document ID and valid status are required" });
            return;
        }
        // Update the document status
        yield Document.findByIdAndUpdate(documentId, { status });
        response.status(200).json({
            success: true,
            message: `Document status updated to ${status}`
        });
    }
    catch (error) {
        console.error("Error updating document status:", error);
        response.status(500).json({ error: "Failed to update document status" });
    }
});
exports.UPDATE_DOCUMENT_STATUS = UPDATE_DOCUMENT_STATUS;
