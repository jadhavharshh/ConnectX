import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";

export const GET_SIGNUP_DATA = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("IN THE SIGN UP FUNCTION");
        console.log(request.body);

        // Assuming the request body contains teacher info
        const { name, department, teacherId, password } = request.body;

        // Create a new Teacher instance
        const newTeacher = new TeacherSchema({
            name,
            department,
            teacherId,
            password,
        });

        // Save the teacher data to the database
        await newTeacher.save();

        response.status(200).json({ message: "Sign up successful" });
    } catch (error) {
        next(error);
    }
};