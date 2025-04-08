import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import {
  MoreVertical,
  Send,
  Paperclip
} from "lucide-react"

// Components and UI
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// Types and data
import { Mail } from "../data"

// Auth and API
import { useAuth } from "@clerk/clerk-react"
import { apiClient } from "@/lib/api-client"

// Socket services
import { initializeSocket, getSocket } from "@/Context/SocketContext"

interface MailDisplayProps {
  mail: Mail | null
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { userId } = useAuth() // Get current user ID from Clerk
  
  // Initialize with empty messages array
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      console.log("Initializing socket for user:", userId);
      const socket = initializeSocket(userId);
      
      // Listen for connection status
      const handleConnect = () => {
        console.log("Socket connected successfully");
        setSocketConnected(true);
      };
      
      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
      };
      
      const handleConnectError = (error: any) => {
        console.error("Socket connection error:", error);
        setSocketConnected(false);
      };
      
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('connect_error', handleConnectError);
      
      // If already connected, set connected state
      if (socket.connected) {
        setSocketConnected(true);
      }
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('connect_error', handleConnectError);
      };
    }
  }, [userId]);

  // Listen for new messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !mail || !userId) {
      console.log("Socket, mail, or userId not available:", { 
        socketAvailable: !!socket, 
        mailAvailable: !!mail, 
        userIdAvailable: !!userId 
      });
      return;
    }
    
    console.log(`Setting up message listeners for conversation with ${mail.name} (${mail.id})`);
    
    // Handle incoming messages
    const handleNewMessage = (message: any) => {
      console.log("New message received:", message);
      
      // Only add if message is for this conversation
      if (
        (message.senderId === mail.id && message.receiverId === userId) ||
        (message.senderId === userId && message.receiverId === mail.id)
      ) {
        console.log("Message belongs to current conversation");
        
        const newMessage: ChatMessage = {
          id: message._id || Date.now().toString(), // Fallback ID if _id is missing
          content: message.content,
          sender: message.senderId === userId ? 'user' : 'bot',
          timestamp: new Date(message.timestamp || Date.now())
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Mark message as read if we're the receiver
        if (message.senderId === mail.id) {
          console.log("Marking message as read");
          socket.emit('mark_as_read', { messageIds: [message._id || newMessage.id] });
        }
      } else {
        console.log("Message not for current conversation");
      }
    };
    
    // Confirmation of message sent
    const handleMessageSent = (message: any) => {
      console.log('Message sent successfully:', message);
      
      // Add message to the UI (in case it's not added by the new_message event)
      const newMessage: ChatMessage = {
        id: message._id || Date.now().toString(),
        content: message.content,
        sender: 'user',
        timestamp: new Date(message.timestamp || Date.now())
      };
      
      // Check if message is already in the list (avoid duplicates)
      const messageExists = messages.some(m => 
        m.content === newMessage.content && 
        Math.abs(new Date(m.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 5000
      );
      
      if (!messageExists) {
        console.log("Adding sent message to UI");
        setMessages(prev => [...prev, newMessage]);
      }
    };
    
    // Handle errors
    const handleError = (error: any) => {
      console.error('Socket error:', error);
    };
    
    // Test message event handler
    const handleTestMessage = (data: any) => {
      console.log('Test message received:', data);
    };
    
    // Register event handlers
    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('error', handleError);
    socket.on('test_message', handleTestMessage);
    
    // Send a ping to the server to make sure the connection is working
    socket.emit('ping', { userId });
    
    return () => {
      console.log("Cleaning up message listeners");
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('error', handleError);
      socket.off('test_message', handleTestMessage);
    };
  }, [mail?.id, userId, messages]);

  // Reset messages when selected mail changes and fetch existing messages
  useEffect(() => {
    if (!mail?.id || !userId) {
      setMessages([]);
      setInputMessage('');
      return;
    }
    
    console.log(`Fetching message history for conversation with ${mail.name} (${mail.id})`);
    
    const fetchMessages = async () => {
      try {
        const response = await apiClient.get('/api/chat/messages', {
          params: {
            userId,
            contactId: mail.id
          }
        });
        
        console.log("Messages fetched:", response.data.messages);
        
        // Transform messages to match our UI format
        const chatMessages: ChatMessage[] = response.data.messages.map((msg: any) => ({
          id: msg._id,
          content: msg.content,
          sender: msg.senderId === userId ? 'user' : 'bot',
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(chatMessages);
        
        // Mark unread messages as read
        const unreadMessageIds = response.data.messages
          .filter((msg: any) => !msg.read && msg.senderId === mail.id)
          .map((msg: any) => msg._id);
        
        if (unreadMessageIds.length > 0) {
          console.log("Marking unread messages as read:", unreadMessageIds);
          await apiClient.post('/api/chat/mark-read', { messageIds: unreadMessageIds });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    fetchMessages();
  }, [mail?.id, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !mail || !userId) return;

    const socket = getSocket();
    if (!socket) {
      console.error('Socket not connected');
      return;
    }
    
    const messageContent = inputMessage.trim();
    setInputMessage(''); // Clear input field immediately
    
    console.log(`Sending message to ${mail.name} (${mail.id}): ${messageContent}`);
    
    // Create a local message object for immediate display
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      // Send message through WebSocket
      socket.emit('send_message', {
        receiverId: mail.id,
        content: messageContent
      });
      
      // If socket isn't connected properly, fall back to API
      if (!socketConnected) {
        console.log("Socket not connected, using API fallback");
        try {
          const response = await apiClient.post('/api/chat/send-message', {
            senderId: userId,
            receiverId: mail.id,
            content: messageContent
          });
          console.log("Message sent via API:", response.data);
        } catch (apiError) {
          console.error("API fallback failed:", apiError);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-full flex-col max-h-screen overflow-hidden">
      {/* Header with connection status */}
      <div className="flex items-center p-3 border-b">
        {mail ? (
          <div className="flex items-start gap-4 text-sm">
            <Avatar>
              <AvatarImage alt={mail.name} />
              <AvatarFallback>
                {mail.name
                  .split(" ")
                  .map((chunk) => chunk[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <div className="font-semibold">{mail.name}</div>
              <div className="line-clamp-1 text-xs flex items-center">
                <span>{mail.id}</span>
                <span className={`ml-2 h-2 w-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs ml-1">{socketConnected ? 'Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No conversation selected
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuItem>Add to favorites</DropdownMenuItem>
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Block user</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                    <AvatarImage src="/bot-avatar.png" alt={mail.name} />
                    <AvatarFallback>
                      {mail.name
                        .split(" ")
                        .map((chunk) => chunk[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                    <AvatarImage src="/user-avatar.png" alt="You" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                  <AvatarImage src="/bot-avatar.png" alt={mail.name} />
                  <AvatarFallback>
                    {mail.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted px-4 py-3 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
              <div className="relative">
                <Textarea
                  className="min-h-[60px] max-h-[120px] p-3 pr-10 resize-none rounded-lg"
                  placeholder={`Message ${mail.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto"
                  disabled={!inputMessage.trim() || !socketConnected}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground flex-1 flex items-center justify-center">
          <div>
            <p className="mb-2">No conversation selected</p>
            <p className="text-xs">Select a conversation from the sidebar to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}