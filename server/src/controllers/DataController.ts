import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";

export const FETCH_USER_INFO = async ( request: Request, response: Response,  next: NextFunction): Promise<void> => {
  try {
    console.log("IN THE FETCH_USER_INFO CONTROLLER");
    const { userId } = request.query;
    const trimmedUserId = (userId as string)?.trim();
    // console.log(trimmedUserId);

    if (!trimmedUserId) {
      response.status(400).json({ error: "Missing or invalid userId" });
      return;
    }

    // Check teacher collection using clerkUserId
    const teacher = await TeacherSchema.findOne({ clerkUserId: trimmedUserId });
    if (teacher) {
      response.status(200).json({ role: "teacher", data: teacher });
      return;
    }

    // Check student collection using clerkUserId
    const student = await StudentSchema.findOne({ clerkUserId: trimmedUserId });
    if (student) {
      response.status(200).json({ role: "student", data: student });
      return;
    }

    // Not found in either collection
    response.status(404).json({ error: "User not found in the database" });
  } catch (error) {
    next(error);
  }
};