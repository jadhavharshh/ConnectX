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
exports.FETCH_RECENT_CHATS = exports.MARK_MESSAGES_READ = exports.GET_CHAT_MESSAGES = exports.FETCH_CHATS = void 0;
const TeacherSchema_1 = __importDefault(require("../models/TeacherSchema"));
const StudentSchema_1 = __importDefault(require("../models/StudentSchema"));
const ChatSchema_1 = __importDefault(require("../models/ChatSchema"));
const FETCH_CHATS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE FETCH_CHATS_FUNCTION");
        const teachers = yield TeacherSchema_1.default.find({});
        const students = yield StudentSchema_1.default.find({});
        const contacts = [
            ...teachers.map((teacher) => ({
                id: teacher.clerkUserId,
                name: teacher.name,
                email: teacher.teacherId, // using teacherId as email
                status: "online", // default status
            })),
            ...students.map((student) => ({
                id: student.clerkUserId,
                name: student.name,
                email: student.email,
                status: "online", // default status
            })),
        ];
        response.json({ contacts });
    }
    catch (error) {
        next(error);
    }
});
exports.FETCH_CHATS = FETCH_CHATS;
// Add function to get chat messages between two users
const GET_CHAT_MESSAGES = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, contactId } = request.query;
        if (!userId || !contactId) {
            response.status(400).json({ error: "Missing user or contact ID" });
            return;
        }
        // Get messages where the current user is either sender or receiver
        const messages = yield ChatSchema_1.default.find({
            $or: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 }); // Order by timestamp ascending
        response.json({ messages });
    }
    catch (error) {
        console.error("Error fetching chat messages:", error);
        response.status(500).json({ error: "Failed to fetch chat messages" });
    }
});
exports.GET_CHAT_MESSAGES = GET_CHAT_MESSAGES;
// Add function to mark messages as read
const MARK_MESSAGES_READ = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageIds } = request.body;
        if (!messageIds || !Array.isArray(messageIds)) {
            response.status(400).json({ error: "Invalid message IDs" });
            return;
        }
        yield ChatSchema_1.default.updateMany({ _id: { $in: messageIds } }, { $set: { read: true } });
        response.json({ success: true });
    }
    catch (error) {
        console.error("Error marking messages as read:", error);
        response.status(500).json({ error: "Failed to mark messages as read" });
    }
});
exports.MARK_MESSAGES_READ = MARK_MESSAGES_READ;
const FETCH_RECENT_CHATS = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("IN THE FETCH_RECENT_CHATS_FUNCTION");
        const { userId } = request.query;
        if (!userId) {
            response.status(400).json({ error: "Missing user ID" });
            return;
        }
        // Get all message groups where the user is involved
        const messages = yield ChatSchema_1.default.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ timestamp: -1 }); // Most recent first
        // Extract unique contact IDs from the messages
        const contactIds = new Set();
        const recentChats = [];
        const processedContacts = new Set();
        // Process messages to get the most recent message with each contact
        messages.forEach(message => {
            const contactId = message.senderId === userId
                ? message.receiverId
                : message.senderId;
            if (!processedContacts.has(contactId)) {
                processedContacts.add(contactId);
                contactIds.add(contactId);
                recentChats.push({
                    contactId,
                    lastMessage: message.content,
                    lastMessageTime: message.timestamp,
                    read: message.read,
                    unreadCount: 0 // Will be calculated below
                });
            }
        });
        // Count unread messages for each contact
        for (let i = 0; i < recentChats.length; i++) {
            const unreadCount = yield ChatSchema_1.default.countDocuments({
                senderId: recentChats[i].contactId,
                receiverId: userId,
                isRead: false
            });
            recentChats[i].unreadCount = unreadCount;
        }
        // Get contact details for the contact IDs
        const teachers = yield TeacherSchema_1.default.find({
            clerkUserId: { $in: Array.from(contactIds) }
        });
        const students = yield StudentSchema_1.default.find({
            clerkUserId: { $in: Array.from(contactIds) }
        });
        // Map contact details to recent chats
        const contactDetails = [...teachers, ...students].reduce((acc, contact) => {
            var _a, _b;
            acc[contact.clerkUserId] = {
                name: contact.name,
                email: (_b = (_a = contact.email) !== null && _a !== void 0 ? _a : contact.teacherId) !== null && _b !== void 0 ? _b : contact.studentId
            };
            return acc;
        }, {});
        // Add contact details to recent chats
        recentChats.forEach(chat => {
            if (contactDetails[chat.contactId]) {
                chat.contactName = contactDetails[chat.contactId].name;
                chat.contactEmail = contactDetails[chat.contactId].email;
            }
        });
        response.json({ recentChats });
    }
    catch (error) {
        console.error("Error fetching recent chats:", error);
        response.status(500).json({ error: "Failed to fetch recent chats" });
    }
});
exports.FETCH_RECENT_CHATS = FETCH_RECENT_CHATS;
