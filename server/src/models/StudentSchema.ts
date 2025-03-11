import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  name: string;
  studentId: string;
  email: string;
  password: string;
  year: "first" | "second" | "third" | "fourth";
  division: string;
}

const StudentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    studentId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    year: { type: String, enum: ["first", "second", "third", "fourth"], required: true },
    division: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);