import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";

export const FETCH_CHATS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE FETCH_CHATS_FUNCTION");
    const teachers = await TeacherSchema.find({});
    const students = await StudentSchema.find({});

    const contacts = [
      ...teachers.map((teacher) => ({
        id: teacher.clerkUserId,
        name: teacher.name,
        email: teacher.teacherId, // using teacherId as email
        status: "online", // default status
      })),
      ...students.map((student) => ({
        id: student.clerkUserId,
        name: student.name,
        email: student.email,
        status: "online", // default status
      })),
    ];

    response.json({ contacts });
  } catch (error) {
    next(error);
  }
};
