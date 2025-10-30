import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
    name: string;
    department: string;
    teacherId: string; // email used as teacherId
    clerkUserId: string; // added clerkUserId field
    password: string;
}

const TeacherSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    teacherId: { type: String, required: true, unique: true },
    clerkUserId: { type: String, required: true }, // added field
    password: { type: String, required: false }
  },
  { timestamps: true }
);

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);