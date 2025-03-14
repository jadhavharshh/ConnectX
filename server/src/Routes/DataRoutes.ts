import { Router } from "express";
import { FETCH_USER_INFO } from "../controllers/DataController";

const DataRoutes = Router();

DataRoutes.get('/fetch-user-info', FETCH_USER_INFO)

export default DataRoutes;