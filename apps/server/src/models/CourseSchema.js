"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false });
const LessonSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoType: { type: String, enum: ["upload", "youtube"], required: true },
    videoUrl: { type: String, required: true },
    youtubeUrl: { type: String },
    localVideoPath: { type: String },
    duration: { type: Number },
    thumbnailUrl: { type: String },
    thumbnailPath: { type: String },
    resources: { type: [ResourceSchema], default: [] },
    position: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const ModuleSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    summary: { type: String },
    lessons: { type: [LessonSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
}, { _id: true });
const CourseSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String },
    coverImagePath: { type: String },
    category: { type: String, default: "General" },
    level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "all"],
        default: "beginner",
    },
    tags: { type: [String], default: [] },
    estimatedHours: { type: Number },
    createdByClerkId: { type: String, required: true },
    createdByName: { type: String },
    createdByEmail: { type: String },
    visibility: { type: String, enum: ["public", "restricted"], default: "public" },
    targetYear: { type: String, default: "All" },
    targetDivision: { type: String, default: "All" },
    modules: { type: [ModuleSchema], default: [] },
    enrolledStudentIds: { type: [String], default: [] },
}, { timestamps: true });
CourseSchema.index({ createdByClerkId: 1 });
CourseSchema.index({ visibility: 1, targetYear: 1, targetDivision: 1 });
CourseSchema.index({ title: "text", description: "text", tags: "text" });
exports.default = mongoose_1.default.models.Course || mongoose_1.default.model("Course", CourseSchema);
