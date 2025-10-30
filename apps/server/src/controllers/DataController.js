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
exports.FETCH_TASKS = exports.CREATE_TASK = exports.FETCH_ANNOUNCEMENTS = exports.FETCH_USER_INFO = exports.CREATE_ANNOUCEMENT = void 0;
const TeacherSchema_1 = __importDefault(require("../models/TeacherSchema"));
const StudentSchema_1 = __importDefault(require("../models/StudentSchema"));
const mongoose_1 = __importDefault(require("mongoose"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const emailService_1 = require("../services/emailService");
// Correctly import and extend Express types
require("express");
// Create Announcement Schema if it doesn't exist yet
const AnnouncementSchema = new mongoose_1.default.Schema({
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
const TaskSchema = new mongoose_1.default.Schema({
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
const Announcement = mongoose_1.default.models.Announcement || mongoose_1.default.model("Announcement", AnnouncementSchema);
const Task = mongoose_1.default.models.Task || mongoose_1.default.model("Task", TaskSchema);
// Configure multer storage
const announcementStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, "../../public/uploads/announcements");
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `announcement-${uniqueSuffix}${ext}`);
    }
});
const taskStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, "../../public/uploads/tasks");
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `task-${uniqueSuffix}${ext}`);
    }
});
const announcementFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new Error("Only image files are allowed"));
    }
};
const taskFileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error("Invalid file type. Supported files: PDF, DOCX, XLSX, Images"));
    }
};
const uploadAnnouncement = (0, multer_1.default)({
    storage: announcementStorage,
    fileFilter: announcementFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("image");
const uploadTaskAttachment = (0, multer_1.default)({
    storage: taskStorage,
    fileFilter: taskFileFilter,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB
}).single("attachment");
const CREATE_ANNOUCEMENT = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("IN THE CREATE_ANNOUCEMENT CONTROLLER");
    uploadAnnouncement(request, response, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err instanceof multer_1.default.MulterError) {
            // A Multer error occurred when uploading
            console.error("Multer error:", err);
            response.status(400).json({ message: `Upload error: ${err.message}` });
            return;
        }
        else if (err) {
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
            console.log("THIS IS THE IMAGE URL");
            console.log(imageUrl);
            if (!imageUrl) {
                response.status(400).json({ message: "Image is required" });
                return;
            }
            // Create the announcement in the database
            const announcement = yield Announcement.create({
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
            (0, emailService_1.notifyAnnouncementCreated)({
                title,
                content,
                category,
                priority,
                author,
                date,
            }).catch((error) => {
                console.error("Failed to trigger announcement notification", error);
            });
        }
        catch (error) {
            console.error("Error creating announcement:", error);
            response.status(500).json({
                message: "Failed to create announcement",
                error: error.message
            });
        }
    }));
});
exports.CREATE_ANNOUCEMENT = CREATE_ANNOUCEMENT;
const FETCH_USER_INFO = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE FETCH_USER_INFO CONTROLLER");
        console.log("Request query:", request.query);
        const { userId } = request.query;
        const trimmedUserId = userId === null || userId === void 0 ? void 0 : userId.trim();
        console.log("Trimmed userId:", trimmedUserId);
        if (!trimmedUserId) {
            response.status(400).json({ error: "Missing or invalid userId" });
            return;
        }
        // Check teacher collection using clerkUserId
        const teacher = yield TeacherSchema_1.default.findOne({ clerkUserId: trimmedUserId });
        if (teacher) {
            response.status(200).json({ role: "teacher", data: teacher });
            return;
        }
        // Check student collection using clerkUserId
        const student = yield StudentSchema_1.default.findOne({ clerkUserId: trimmedUserId });
        if (student) {
            response.status(200).json({ role: "student", data: student });
            return;
        }
        // Not found in either collection
        response.status(404).json({ error: "User not found in the database" });
    }
    catch (error) {
        next(error);
    }
});
exports.FETCH_USER_INFO = FETCH_USER_INFO;
// Add this function to your existing DataController.ts file
const FETCH_ANNOUNCEMENTS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE FETCH_ANNOUNCEMENTS CONTROLLER");
        // Get announcements from the database, sorted by newest first
        const announcements = yield Announcement.find({}).sort({ createdAt: -1 });
        response.status(200).json({
            message: "Announcements fetched successfully",
            announcements
        });
    }
    catch (error) {
        console.error("Error fetching announcements:", error);
        response.status(500).json({
            message: "Failed to fetch announcements",
            error: error.message
        });
    }
});
exports.FETCH_ANNOUNCEMENTS = FETCH_ANNOUNCEMENTS;
// New CREATE_TASK function 
const CREATE_TASK = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("IN THE CREATE_TASK CONTROLLER");
    uploadTaskAttachment(request, response, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err instanceof multer_1.default.MulterError) {
            console.error("Multer error:", err);
            response.status(400).json({ message: `Upload error: ${err.message}` });
            return;
        }
        else if (err) {
            console.error("Unknown upload error:", err);
            response.status(500).json({ message: `Unknown upload error: ${err.message}` });
            return;
        }
        try {
            const { title, description, subject, priority, dueDate, points, assignedYear, assignedDivision, createdDate } = request.body;
            // Validation for required fields
            if (!title || !description) {
                response.status(400).json({ message: "Missing required fields" });
                return;
            }
            // Create task object
            const taskData = {
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
            const task = yield Task.create(taskData);
            response.status(201).json({
                message: "Task created successfully",
                task
            });
            console.log("Task created:", task);
            const formatDateForEmail = (value) => {
                if (!value)
                    return undefined;
                const parsed = new Date(value);
                if (Number.isNaN(parsed.getTime())) {
                    return value;
                }
                return parsed.toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            };
            const normalizedYear = assignedYear && assignedYear !== "None" ? assignedYear : undefined;
            const normalizedDivision = assignedDivision && assignedDivision !== "None" ? assignedDivision : undefined;
            (0, emailService_1.notifyTaskCreated)({
                title,
                description,
                subject,
                priority,
                dueDate: formatDateForEmail(dueDate),
                points,
                assignedYear: normalizedYear,
                assignedDivision: normalizedDivision,
            }).catch((error) => {
                console.error("Failed to trigger task notification", error);
            });
        }
        catch (error) {
            console.error("Error creating task:", error);
            response.status(500).json({
                message: "Failed to create task",
                error: error.message
            });
        }
    }));
});
exports.CREATE_TASK = CREATE_TASK;
// Add FETCH_TASKS function to get all tasks
const FETCH_TASKS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE FETCH_TASKS CONTROLLER");
        // Get tasks from the database, sorted by newest first
        const tasks = yield Task.find({}).sort({ createdAt: -1 });
        response.status(200).json({
            message: "Tasks fetched successfully",
            tasks
        });
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        response.status(500).json({
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
});
exports.FETCH_TASKS = FETCH_TASKS;
