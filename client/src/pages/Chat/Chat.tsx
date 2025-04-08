import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@clerk/clerk-react";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Mail } from "@/Mail/components/mail";
import { apiClient } from "@/lib/api-client";
import { FETCH_CHAT, FETCH_RECENT_CHATS } from "@/utils/constants";

export default function Chat() {
  const [mails, setMails] = useState<any[]>([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Fetch recent chats when component mounts
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user?.id) {
        console.log("No user ID available");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching recent chats for user:", user.id);
        
        const response = await apiClient.get(FETCH_RECENT_CHATS, {
          params: { userId: user.id }
        });
        
        console.log("API response:", response.data);
        
        if (response.data.recentChats && response.data.recentChats.length > 0) {
          // Convert recent chats to mail items with all required fields
          const recentChatMails = response.data.recentChats.map((chat: any) => ({
            id: chat.contactId,
            name: chat.contactName || "Unknown User",
            email: chat.contactEmail || "",
            subject: "Recent conversation",
            text: chat.lastMessage || "Start chatting with this contact",
            date: new Date(chat.lastMessageTime).toISOString() || new Date().toISOString(),
            read: !!chat.read,
            labels: chat.unreadCount > 0 ? ["unread"] : [],
            unreadCount: chat.unreadCount || 0
          }));
          
          setMails(recentChatMails);
          console.log("Recent chats processed for display:", recentChatMails);
        } else {
          console.log("No recent chats found, fetching all contacts");
          fetchAllContacts();
        }
      } catch (error) {
        console.error("Error fetching recent chats:", error);
        fetchAllContacts();
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchAllContacts = async () => {
      try {
        const response = await apiClient.get(FETCH_CHAT);
        console.log("Contacts API response:", response.data);
        
        if (response.data.contacts) {
          setContacts(response.data.contacts);
          
          // Convert contacts to mail items
          const contactMails = response.data.contacts.map((contact: any) => ({
            id: contact.id || contact._id,
            name: contact.name || "Unknown User",
            email: contact.email || contact.teacherId || contact.studentId || "",
            subject: "New conversation",
            text: "Start chatting with this contact",
            date: new Date().toISOString(),
            read: true,
            labels: []
          }));
          
          setMails(contactMails);
          console.log("Contacts loaded as mail items:", contactMails);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      fetchRecentChats();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  console.log("Rendering with mails:", mails);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-muted-foreground">Loading conversations...</div>
              </div>
            </div>
          ) : (
            <div className="flex-col md:flex h-full">
              {mails.length > 0 ? (
                <Mail
                  accounts={[]}
                  mails={mails}
                  defaultLayout={[40, 60]}
                  navCollapsedSize={4}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-2 text-xl font-semibold">No conversations yet</div>
                    <p className="text-muted-foreground">
                      You don't have any conversations yet. Start chatting with a contact.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}