"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STORE_SIGNUP_DATA = void 0;
const TeacherSchema_1 = __importDefault(require("../models/TeacherSchema"));
const StudentSchema_1 = __importDefault(require("../models/StudentSchema"));
const STORE_SIGNUP_DATA = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE SIGN UP FUNCTION");
        console.log(request.body);
        // Check the role field to determine which schema to use
        const { role } = request.body;
        if (role === "teacher") {
            const { name, department, teacherId, password, clerkUserId } = request.body;
            const newTeacher = new TeacherSchema_1.default({
                name,
                department,
                teacherId,
                password,
                clerkUserId, // storing the clerkUserId as provided
            });
            console.log("-----------------");
            console.log(newTeacher);
            console.log("-----------------");
            yield newTeacher.save();
            response.status(200).json({ message: "Teacher sign up successful" });
        }
        else if (role === "student") {
            const { name, studentId, email, password, year, division, clerkUserId } = request.body;
            const newStudent = new StudentSchema_1.default({
                name,
                studentId,
                email,
                password,
                year,
                division,
                clerkUserId, // storing the clerkUserId as provided
            });
            console.log("-----------------");
            console.log(newStudent);
            console.log("-----------------");
            yield newStudent.save();
            response.status(200).json({ message: "Student sign up successful" });
        }
        else {
            response.status(400).json({ message: "Invalid role provided" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.STORE_SIGNUP_DATA = STORE_SIGNUP_DATA;
