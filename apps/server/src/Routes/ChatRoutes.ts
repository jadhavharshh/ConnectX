import { Router } from "express";
import { FETCH_CHATS, FETCH_RECENT_CHATS, GET_CHAT_MESSAGES, MARK_MESSAGES_READ } from "../controllers/ChatController";

const ChatRoutes = Router();

ChatRoutes.get('/fetch-chats', FETCH_CHATS);
ChatRoutes.get('/recent', FETCH_RECENT_CHATS);
ChatRoutes.get('/messages', GET_CHAT_MESSAGES);
ChatRoutes.post('/mark-read', MARK_MESSAGES_READ);

export default ChatRoutes;