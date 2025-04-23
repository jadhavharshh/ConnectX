import { Router } from "express";
import { ADD_MENTEES, FETCH_MENTEES, FETCH_MENTEE_DOCUMENTS, FETCH_ALL_STUDENTS, UPDATE_DOCUMENT_STATUS } from "../controllers/MentorController";

const MentorRoutes = Router();

MentorRoutes.get('/fetch-mentees', FETCH_MENTEES);
MentorRoutes.get('/fetch-all-students', FETCH_ALL_STUDENTS); // Add this new route
MentorRoutes.post('/add-mentees', ADD_MENTEES);
MentorRoutes.get('/documents', FETCH_MENTEE_DOCUMENTS);
MentorRoutes.patch('/update-document-status', UPDATE_DOCUMENT_STATUS);

export default MentorRoutes;