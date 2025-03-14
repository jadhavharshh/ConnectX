import { Router } from "express";
import { STORE_SIGNUP_DATA } from "../controllers/AuthController";

const AuthRoutes = Router();

AuthRoutes.post('/send-signup-data', STORE_SIGNUP_DATA )
export default AuthRoutes;