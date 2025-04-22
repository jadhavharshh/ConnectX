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
import { 
  Book, 
  Calendar, 
  User, 
  School, 
  Sparkles, 
  Bot, 
  RefreshCw, 
  Send, 
  Zap, 
  MessageSquare,
  Lightbulb
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  isUser: boolean;
  content: string;
  timestamp: string;
}

interface PromptTemplate {
  id: string;
  category: string;
  icon: React.ReactNode;
  title: string;
  prompt: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Define prompt templates
  const promptTemplates: PromptTemplate[] = [
    {
      id: "assignments",
      category: "academic",
      icon: <Book className="h-4 w-4" />,
      title: "Upcoming Assignments",
      prompt: "What are my upcoming assignments and their deadlines?"
    },
    {
      id: "announcements",
      category: "updates",
      icon: <MessageSquare className="h-4 w-4" />,
      title: "Recent Announcements",
      prompt: "Can you summarize the recent announcements from the past week?"
    },
    {
      id: "schedule",
      category: "academic",
      icon: <Calendar className="h-4 w-4" />,
      title: "My Schedule",
      prompt: "What classes do I have this week?"
    },
    {
      id: "professors",
      category: "academic",
      icon: <User className="h-4 w-4" />,
      title: "Professor Office Hours",
      prompt: "When are the office hours for my professors?"
    },
    {
      id: "events",
      category: "campus",
      icon: <School className="h-4 w-4" />,
      title: "Campus Events",
      prompt: "What events are happening on campus this month?"
    },
    {
      id: "explain",
      category: "study",
      icon: <Lightbulb className="h-4 w-4" />,
      title: "Explain Concept",
      prompt: "Can you explain the concept of [topic] in simple terms?"
    }
  ];

  // Add a welcome message when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          isUser: false,
          content: "Hello! I'm your AI assistant. I can help with information about your courses, assignments, campus events, and more. Try one of the templates below or ask me anything!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  // Simulated typing effect for AI responses
  useEffect(() => {
    if (isTyping && typingText) {
      const timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
          {
            id: `ai-${Date.now()}`,
            isUser: false,
            content: typingText,
            timestamp: new Date().toISOString(),
          }
        ]);
        setTypingText("");
      }, 1500); // Adjust timing for typing effect
      
      return () => clearTimeout(timeout);
    }
  }, [isTyping, typingText]);

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-msg-reset",
        isUser: false,
        content: "Chat history cleared. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handlePromptTemplate = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

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
      
      // Start typing effect with the response
      setTypingText(response.data.response || "I couldn't process that request. Please try again.");
      setIsTyping(true);
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
        <div className="flex flex-col h-full bg-muted/5">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">ConnectX AI Assistant</h1>
                  <p className="text-sm text-muted-foreground">
                    Powered by advanced AI models to help you succeed
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={clearChat}
                      className="h-9 w-9"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear chat history</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} gap-2 items-end`}
                >
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/images/ai-assistant.png" alt="AI" />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        {message.isUser ? (
                          "You"
                        ) : (
                          <span className="flex items-center gap-1">
                            ConnectX AI <Zap className="h-3 w-3 text-yellow-500" />
                          </span>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="mt-1 text-xs opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                  {message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "user"}`} 
                        alt="User" 
                      />
                      <AvatarFallback className="bg-primary/10">
                        {user?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isLoading && !isTyping && (
                <div className="flex justify-start gap-2 items-end">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/ai-assistant.png" alt="AI" />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg p-3 bg-card border shadow-sm">
                    <div className="flex flex-col">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        ConnectX AI <Zap className="h-3 w-3 text-yellow-500" />
                      </div>
                      <div className="flex space-x-2 items-center">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isTyping && typingText && (
                <div className="flex justify-start gap-2 items-end">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/ai-assistant.png" alt="AI" />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg p-3 bg-card border shadow-sm">
                    <div className="flex flex-col">
                      <div className="text-xs font-medium mb-1 flex items-center gap-1">
                        ConnectX AI <Zap className="h-3 w-3 text-yellow-500" />
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{typingText}</div>
                      <div className="mt-1 text-xs opacity-70 text-right">
                        {formatTime(new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything about your courses, assignments, or campus..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !inputValue.trim()}
                className="gap-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="sr-only">Sending</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-3">
              <Tabs defaultValue="all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Prompt Templates</h3>
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                    <TabsTrigger value="academic" className="text-xs h-7">Academic</TabsTrigger>
                    <TabsTrigger value="updates" className="text-xs h-7">Updates</TabsTrigger>
                    <TabsTrigger value="campus" className="text-xs h-7">Campus</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="m-0">
                  <div className="flex flex-wrap gap-2">
                    {promptTemplates.map((template) => (
                      <Badge 
                        key={template.id}
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-2 flex items-center gap-1"
                        onClick={() => handlePromptTemplate(template.prompt)}
                      >
                        {template.icon}
                        <span>{template.title}</span>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="academic" className="m-0">
                  <div className="flex flex-wrap gap-2">
                    {promptTemplates
                      .filter(t => t.category === "academic" || t.category === "study")
                      .map((template) => (
                        <Badge 
                          key={template.id}
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-2 flex items-center gap-1"
                          onClick={() => handlePromptTemplate(template.prompt)}
                        >
                          {template.icon}
                          <span>{template.title}</span>
                        </Badge>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="updates" className="m-0">
                  <div className="flex flex-wrap gap-2">
                    {promptTemplates
                      .filter(t => t.category === "updates")
                      .map((template) => (
                        <Badge 
                          key={template.id}
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-2 flex items-center gap-1"
                          onClick={() => handlePromptTemplate(template.prompt)}
                        >
                          {template.icon}
                          <span>{template.title}</span>
                        </Badge>
                      ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="campus" className="m-0">
                  <div className="flex flex-wrap gap-2">
                    {promptTemplates
                      .filter(t => t.category === "campus")
                      .map((template) => (
                        <Badge 
                          key={template.id}
                          variant="outline" 
                          className="cursor-pointer hover:bg-primary/10 transition-colors py-1 px-2 flex items-center gap-1"
                          onClick={() => handlePromptTemplate(template.prompt)}
                        >
                          {template.icon}
                          <span>{template.title}</span>
                        </Badge>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}