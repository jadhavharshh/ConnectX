import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
    name: string;
    department: string;
    teacherId: string; // email used as teacherId
    password: string;
}

const TeacherSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    department: { type: String, required: true },
    teacherId: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);