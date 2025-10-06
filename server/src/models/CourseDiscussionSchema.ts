import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDiscussionMessage {
  _id: Types.ObjectId;
  senderClerkId: string;
  senderRole: "teacher" | "student";
  senderName?: string;
  senderEmail?: string;
  message: string;
  createdAt: Date;
}

export interface ICourseDiscussion extends Document {
  course: Types.ObjectId;
  moduleId?: Types.ObjectId;
  lessonId: Types.ObjectId;
  question: string;
  askedByClerkId: string;
  askedByName?: string;
  askedByEmail?: string;
  status: "open" | "answered" | "closed";
  messages: IDiscussionMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionMessageSchema = new Schema<IDiscussionMessage>(
  {
    senderClerkId: { type: String, required: true },
    senderRole: { type: String, enum: ["teacher", "student"], required: true },
    senderName: { type: String },
    senderEmail: { type: String },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const CourseDiscussionSchema = new Schema<ICourseDiscussion>(
  {
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: Schema.Types.ObjectId },
    lessonId: { type: Schema.Types.ObjectId, required: true },
    question: { type: String, required: true },
    askedByClerkId: { type: String, required: true },
    askedByName: { type: String },
    askedByEmail: { type: String },
    status: { type: String, enum: ["open", "answered", "closed"], default: "open" },
    messages: { type: [DiscussionMessageSchema], default: [] },
  },
  { timestamps: true }
);

CourseDiscussionSchema.index({ course: 1, lessonId: 1 });
CourseDiscussionSchema.index({ status: 1 });

export default mongoose.models.CourseDiscussion ||
  mongoose.model<ICourseDiscussion>("CourseDiscussion", CourseDiscussionSchema);
