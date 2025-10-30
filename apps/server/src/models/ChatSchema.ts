import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  senderId: string;  // Clerk user ID of the sender
  receiverId: string; // Clerk user ID of the receiver
  content: string;
  timestamp: Date;
  read: boolean;
}

const ChatMessageSchema: Schema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create index for efficiently querying conversations
ChatMessageSchema.index({ senderId: 1, receiverId: 1 });

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);