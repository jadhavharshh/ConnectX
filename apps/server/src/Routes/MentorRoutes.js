"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MentorController_1 = require("../controllers/MentorController");
const MentorRoutes = (0, express_1.Router)();
MentorRoutes.get('/fetch-mentees', MentorController_1.FETCH_MENTEES);
MentorRoutes.get('/fetch-all-students', MentorController_1.FETCH_ALL_STUDENTS); // Add this new route
MentorRoutes.post('/add-mentees', MentorController_1.ADD_MENTEES);
MentorRoutes.get('/documents', MentorController_1.FETCH_MENTEE_DOCUMENTS);
MentorRoutes.patch('/update-document-status', MentorController_1.UPDATE_DOCUMENT_STATUS);
exports.default = MentorRoutes;
