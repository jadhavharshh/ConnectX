import { Router } from "express";
import { CREATE_ANNOUCEMENT, FETCH_USER_INFO } from "../controllers/DataController";

const DataRoutes = Router();

DataRoutes.get('/fetch-user-info', FETCH_USER_INFO)
DataRoutes.post('/create-announcement', CREATE_ANNOUCEMENT)
export default DataRoutes;