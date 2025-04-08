import { Request, Response, NextFunction } from "express";
import TeacherSchema from "../models/TeacherSchema";
import StudentSchema from "../models/StudentSchema";
import ChatMessageModel from "../models/ChatSchema";

export const FETCH_CHATS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE FETCH_CHATS_FUNCTION");
    const teachers = await TeacherSchema.find({});
    const students = await StudentSchema.find({});

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
  } catch (error) {
    next(error);
  }
};

// Add function to get chat messages between two users
export const GET_CHAT_MESSAGES = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, contactId } = request.query;
    
    if (!userId || !contactId) {
      response.status(400).json({ error: "Missing user or contact ID" });
      return;
    }
    
    // Get messages where the current user is either sender or receiver
    const messages = await ChatMessageModel.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 }); // Order by timestamp ascending
    
    response.json({ messages });
    
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    response.status(500).json({ error: "Failed to fetch chat messages" });
  }
};

// Add function to mark messages as read
export const MARK_MESSAGES_READ = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageIds } = request.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      response.status(400).json({ error: "Invalid message IDs" });
      return;
    }
    
    await ChatMessageModel.updateMany(
      { _id: { $in: messageIds } },
      { $set: { read: true } }
    );
    
    response.json({ success: true });
    
  } catch (error) {
    console.error("Error marking messages as read:", error);
    response.status(500).json({ error: "Failed to mark messages as read" });
  }
};


export const FETCH_RECENT_CHATS = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("IN THE FETCH_RECENT_CHATS_FUNCTION");
    const { userId } = request.query;
    
    if (!userId) {
      response.status(400).json({ error: "Missing user ID" });
      return;
    }
    
    // Get all message groups where the user is involved
    const messages = await ChatMessageModel.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    }).sort({ timestamp: -1 }); // Most recent first
    
    // Extract unique contact IDs from the messages
    const contactIds = new Set<string>();
    const recentChats: any[] = [];
    const processedContacts = new Set<string>();
    
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
      const unreadCount = await ChatMessageModel.countDocuments({
        senderId: recentChats[i].contactId,
        receiverId: userId,
        isRead: false
      });
      
      recentChats[i].unreadCount = unreadCount;
    }
    
    // Get contact details for the contact IDs
    const teachers = await TeacherSchema.find({
      clerkUserId: { $in: Array.from(contactIds) }
    });
    
    const students = await StudentSchema.find({
      clerkUserId: { $in: Array.from(contactIds) }
    });
    
    // Map contact details to recent chats
    const contactDetails = [...teachers, ...students].reduce((acc, contact: { clerkUserId: string; name: string; email?: string; teacherId?: string; studentId?: string }) => {
      acc[contact.clerkUserId] = {
        name: contact.name,
        email: contact.email ?? contact.teacherId ?? contact.studentId
      };
      return acc;
    }, {} as Record<string, any>);
    
    // Add contact details to recent chats
    recentChats.forEach(chat => {
      if (contactDetails[chat.contactId]) {
        chat.contactName = contactDetails[chat.contactId].name;
        chat.contactEmail = contactDetails[chat.contactId].email;
      }
    });
    
    response.json({ recentChats });
    
  } catch (error) {
    console.error("Error fetching recent chats:", error);
    response.status(500).json({ error: "Failed to fetch recent chats" });
  }
};