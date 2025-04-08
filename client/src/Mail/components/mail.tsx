"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MailDisplay } from "./mail-display"
import { MailList } from "./mail-list"
import { type Mail } from "../data"
import { useMail } from "../use-mail"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AddContactDialog } from "@/pages/Chat/components/AddContactDialog"
import { apiClient } from "@/lib/api-client"
import { FETCH_CHAT } from "@/utils/constants"

interface Contact {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: Mail[]
  defaultLayout?: number[]
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function Mail({
  mails: initialMails,
  defaultLayout = [40, 60], // Updated to only have two panels
}: MailProps) {
  const [mail, setMail] = useMail()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [mails, setMails] = useState<Mail[]>([]) // Start with empty mails array

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await apiClient.get(FETCH_CHAT)
        setContacts(response.data.contacts.map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          email: user.email || user.teacherId || user.studentId,
          status: user.status || "online",
        })))
      } catch (error) {
        console.error("Error fetching contacts:", error)
      }
    }
    
    fetchContacts()
  }, [])

  const handleAddContact = (userId: string) => {
    // Find the user from contacts
    const contact = contacts.find((contact: Contact) => contact.id === userId);
    
    if (contact) {
      // Create a new mail item for this contact
      const newMail: Mail = {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: "New conversation",
        text: "Start chatting with this contact",
        date: new Date().toISOString(),
        read: true,
        labels: []
      };
      
      // Add this new mail to the mails array if it doesn't already exist
      if (!mails.some(m => m.id === newMail.id)) {
        setMails(prev => [...prev, newMail]);
      }
      
      // Select this mail immediately
      setMail({
        ...mail,
        selected: newMail.id
      });
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-full max-h-screen">
        
        {/* Two-panel layout instead of three */}
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
              sizes
            )}`
          }}
          className="h-[calc(100%-52px)] max-h-screen items-stretch"
        >
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
            <Tabs defaultValue="all">
              <div className="flex items-center px-4 py-2">
                {/* SidebarTrigger next to the Inbox text */}
                <SidebarTrigger className="mr-2" />
                <h1 className="text-xl font-bold">Inbox</h1>
                
                {/* Add the AddContactDialog button here */}
                <div className="ml-auto mr-2">
                  <AddContactDialog onAddContact={handleAddContact} />
                </div>
                
                <TabsList>
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    All mail
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Unread
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                  </div>
                </form>
              </div>
              <TabsContent value="all" className="m-0">
                <MailList items={mails} />
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                <MailList items={mails.filter((item) => !item.read)} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            <MailDisplay
              mail={mails.find((item) => item.id === mail.selected) || null}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  )
}