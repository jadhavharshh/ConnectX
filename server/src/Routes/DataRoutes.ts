import { Router } from "express";
import { CREATE_ANNOUCEMENT, CREATE_TASK, FETCH_ANNOUNCEMENTS, FETCH_TASKS, FETCH_USER_INFO } from "../controllers/DataController";

const DataRoutes = Router();

DataRoutes.get('/fetch-user-info', FETCH_USER_INFO)
DataRoutes.post('/create-announcement', CREATE_ANNOUCEMENT)
DataRoutes.get('/fetch-announcements', FETCH_ANNOUNCEMENTS)

DataRoutes.post('/create-task' , CREATE_TASK)
DataRoutes.get('/fetch-task', FETCH_TASKS)

export default DataRoutes;