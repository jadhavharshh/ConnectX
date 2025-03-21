"use client"

import * as React from "react"
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
  mails,
  defaultLayout = [40, 60], // Updated to only have two panels
}: MailProps) {
  const [mail, setMail] = useMail()

  const handleAddContact = (userId: string) => {
    // In a real application, this would create a new conversation or add the user to contacts
    console.log(`Adding contact with ID: ${userId}`)
    // You might want to fetch the user data and add a new mail item
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