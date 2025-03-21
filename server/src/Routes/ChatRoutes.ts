import { Router } from "express";
import { FETCH_CHATS } from "../controllers/ChatController";

const ChatRoutes = Router();

ChatRoutes.get('/fetch-chats', FETCH_CHATS)
export default ChatRoutes;