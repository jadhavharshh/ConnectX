import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICourseResource {
  title: string;
  url: string;
}

export interface ICourseLesson {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  videoType: "upload" | "youtube";
  videoUrl: string;
  youtubeUrl?: string;
  localVideoPath?: string;
  duration?: number;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  resources: ICourseResource[];
  position: number;
  createdAt: Date;
}

export interface ICourseModule {
  _id: Types.ObjectId;
  title: string;
  summary?: string;
  lessons: ICourseLesson[];
  createdAt: Date;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  coverImageUrl?: string;
  coverImagePath?: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced" | "all";
  tags: string[];
  estimatedHours?: number;
  createdByClerkId: string;
  createdByName?: string;
  createdByEmail?: string;
  visibility: "public" | "restricted";
  targetYear: string;
  targetDivision: string;
  modules: ICourseModule[];
  enrolledStudentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<ICourseResource>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const LessonSchema = new Schema<ICourseLesson>(
  {
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
  },
  { _id: true }
);

const ModuleSchema = new Schema<ICourseModule>(
  {
    title: { type: String, required: true },
    summary: { type: String },
    lessons: { type: [LessonSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CourseSchema = new Schema<ICourse>(
  {
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
  },
  { timestamps: true }
);

CourseSchema.index({ createdByClerkId: 1 });
CourseSchema.index({ visibility: 1, targetYear: 1, targetDivision: 1 });
CourseSchema.index({ title: "text", description: "text", tags: "text" });

export default mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
