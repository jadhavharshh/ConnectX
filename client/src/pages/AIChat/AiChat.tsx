import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@clerk/clerk-react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { pyApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  isUser: boolean;
  content: string;
  timestamp: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add a welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          isUser: false,
          content: "Hello! I'm your AI assistant. Ask me anything about colleges, announcements, or tasks!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      isUser: true,
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Make a request to the AI endpoint
      const response = await pyApiClient.post("/get-ai-response", {
        query: inputValue,
        userId: user?.id,
      });
      
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        isUser: false,
        content: response.data.response || "I couldn't process that request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const errorResponse: Message = {
        id: `error-${Date.now()}`,
        isUser: false,
        content: "Sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Format timestamp to a readable format
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Ask questions about colleges, announcements, or tasks
            </p>
          </div>
          
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">
                      {message.isUser ? "You" : "AI Assistant"}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-1 text-xs opacity-70 text-right">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted animate-pulse">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">AI Assistant</div>
                    <div className="mt-1">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about colleges, announcements, or tasks..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}