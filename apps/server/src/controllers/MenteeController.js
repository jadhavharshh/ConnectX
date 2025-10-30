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
exports.DELETE_DOCUMENT = exports.UPLOAD_DOCUMENT = exports.FETCH_DOCUMENTS = exports.FETCH_DOCUMENT_CATEGORIES = exports.FETCH_MENTOR = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const TeacherSchema_1 = __importDefault(require("../models/TeacherSchema"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the schemas directly in this file as well to ensure they exist
const MentorMenteeSchema = new mongoose_1.default.Schema({
    mentorId: { type: String, required: true },
    studentId: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now }
});
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
const DocumentCategorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    description: { type: String, required: true }
});
// Initialize models (making sure they exist)
const MentorMentee = mongoose_1.default.models.MentorMentee || mongoose_1.default.model("MentorMentee", MentorMenteeSchema);
const Document = mongoose_1.default.models.Document || mongoose_1.default.model("Document", DocumentSchema);
const DocumentCategory = mongoose_1.default.models.DocumentCategory || mongoose_1.default.model("DocumentCategory", DocumentCategorySchema);
// Configure multer storage for document uploads
const documentStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../public/uploads/documents');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, 'document-' + uniqueSuffix + extension);
    }
});
// Define the multer middleware for document uploads
const uploadDocument = (0, multer_1.default)({ storage: documentStorage }).single('file');
/**
 * Fetch mentor assigned to a specific student
 */
const FETCH_MENTOR = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("In the FETCH_MENTOR function");
        const { studentId } = request.query;
        if (!studentId) {
            response.status(400).json({ error: "Student ID is required" });
            return;
        }
        // Find the mentor-mentee relationship for this student
        const mentorship = yield MentorMentee.findOne({ studentId });
        if (!mentorship) {
            response.status(200).json({ mentor: null });
            return;
        }
        // Find the mentor
        const mentor = yield TeacherSchema_1.default.findOne({ clerkUserId: mentorship.mentorId });
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
    }
    catch (error) {
        console.error("Error fetching mentor:", error);
        response.status(500).json({ error: "Failed to fetch mentor" });
    }
});
exports.FETCH_MENTOR = FETCH_MENTOR;
// Rest of your controller functions...
/**
 * Fetch document categories
 */
const FETCH_DOCUMENT_CATEGORIES = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the FETCH_DOCUMENT_CATEGORIES function");
    try {
        // If no categories exist yet, create some default ones
        const categoryCount = yield DocumentCategory.countDocuments();
        if (categoryCount === 0) {
            // Create default categories
            yield DocumentCategory.insertMany([
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
        const categories = yield DocumentCategory.find();
        response.status(200).json({
            categories: categories.map(category => ({
                id: category._id,
                name: category.name,
                required: category.required,
                description: category.description
            }))
        });
    }
    catch (error) {
        console.error("Error fetching document categories:", error);
        response.status(500).json({ error: "Failed to fetch document categories" });
    }
});
exports.FETCH_DOCUMENT_CATEGORIES = FETCH_DOCUMENT_CATEGORIES;
/**
 * Fetch documents for a specific student
 */
const FETCH_DOCUMENTS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the FETCH_DOCUMENTS function");
    try {
        const { studentId } = request.query;
        if (!studentId) {
            response.status(400).json({ error: "Student ID is required" });
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
        console.error("Error fetching documents:", error);
        response.status(500).json({ error: "Failed to fetch documents" });
    }
});
exports.FETCH_DOCUMENTS = FETCH_DOCUMENTS;
/**
 * Upload a new document
 */
const UPLOAD_DOCUMENT = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the UPLOAD_DOCUMENT function");
    uploadDocument(request, response, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err instanceof multer_1.default.MulterError) {
            console.error("Multer error:", err);
            return response.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        }
        else if (err) {
            console.error("Unknown upload error:", err);
            return response.status(500).json({ success: false, message: `Unknown upload error: ${err.message}` });
        }
        try {
            console.log("Request body:", request.body);
            console.log("Request file:", request.file);
            const { documentName, categoryId, studentId } = request.body;
            if (!documentName || !categoryId || !studentId || !request.file) {
                console.error("Missing required fields:", { documentName, categoryId, studentId, file: !!request.file });
                response.status(400).json({ success: false, message: "Missing required fields" });
                return;
            }
            // Get the file details
            const file = request.file;
            const fileUrl = `${request.protocol}://${request.get('host')}/uploads/documents/${file.filename}`;
            // Create the document record
            const newDocument = yield Document.create({
                studentId,
                name: documentName,
                type: path_1.default.extname(file.originalname).substring(1).toUpperCase(),
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
        }
        catch (error) {
            console.error("Error uploading document:", error);
            response.status(500).json({ success: false, message: "Failed to upload document" });
        }
    }));
});
exports.UPLOAD_DOCUMENT = UPLOAD_DOCUMENT;
/**
 * Delete a document
 */
const DELETE_DOCUMENT = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("In the DELETE_DOCUMENT function");
    try {
        const { documentId } = request.body;
        if (!documentId) {
            response.status(400).json({ message: "Document ID is required" });
            return;
        }
        // Find the document first to get the file URL
        const document = yield Document.findById(documentId);
        if (!document) {
            response.status(404).json({ message: "Document not found" });
            return;
        }
        // Delete the document from the database
        yield Document.findByIdAndDelete(documentId);
        // Try to delete the physical file if possible
        try {
            const urlParts = document.url.split('/');
            const filename = urlParts[urlParts.length - 1];
            const filePath = path_1.default.join(__dirname, '../../public/uploads/documents', filename);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (fileError) {
            console.error("Error deleting file:", fileError);
            // Continue execution even if file deletion fails
        }
        response.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting document:", error);
        response.status(500).json({ message: "Failed to delete document" });
    }
});
exports.DELETE_DOCUMENT = DELETE_DOCUMENT;
