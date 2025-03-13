import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";

export const GET_SIGNUP_DATA = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE SIGN UP FUNCTION");
    console.log(request.body);

    // Check the role field to determine which schema to use
    const { role } = request.body;

    if (role === "teacher") {
      const { name, department, teacherId, password, clerkUserId } = request.body;

      const newTeacher = new TeacherSchema({
        name,
        department,
        teacherId,
        password,
        clerkUserId, // storing the clerkUserId as provided
      });

      await newTeacher.save();
      response.status(200).json({ message: "Teacher sign up successful" });
    } else if (role === "student") {
      const { name, studentId, email, password, year, division, clerkUserId } = request.body;

      const newStudent = new StudentSchema({
        name,
        studentId,
        email,
        password,
        year,
        division,
        clerkUserId, // storing the clerkUserId as provided
      });

      await newStudent.save();
      response.status(200).json({ message: "Student sign up successful" });
    } else {
      response.status(400).json({ message: "Invalid role provided" });
    }
  } catch (error) {
    next(error);
  }
};