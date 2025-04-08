import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Mail } from "@/Mail/components/mail";
import { mails as initialMails } from "@/Mail/data";
import { apiClient } from "@/lib/api-client";
import { FETCH_CHAT } from "@/utils/constants";

export default function Chat() {
  const [mails, setMails] = useState(initialMails);
  const [contacts, setContacts] = useState([]);

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await apiClient.get(FETCH_CHAT);
        setContacts(response.data.contacts);
        
        // Convert contacts to mail items if needed
        const contactMails = response.data.contacts.map((contact: any) => ({
          id: contact._id || contact.id,
          name: contact.name,
          email: contact.email || contact.teacherId || contact.studentId,
          subject: "New conversation",
          text: "Start chatting with this contact",
          date: new Date().toISOString(),
          read: true,
          labels: []
        }));
        
        // Replace or merge with initial mails as needed
        setMails(contactMails);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    
    fetchContacts();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 pt-0">
          <div className="hidden flex-col md:flex ">
            <Mail
              accounts={[]}
              mails={mails}
              defaultLayout={[40, 60]}
              navCollapsedSize={4}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}