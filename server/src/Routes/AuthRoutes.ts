import { Router } from "express";
import { GET_SIGNUP_DATA } from "../controllers/AuthController";

const AuthRoutes = Router();

AuthRoutes.post('/send-signup-data', GET_SIGNUP_DATA )
export default AuthRoutes;