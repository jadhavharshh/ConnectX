import * as React from "react"
import {
  GalleryVerticalEnd,
  SquareTerminal,
  Settings2,
  NotebookIcon,
  User2Icon,
  MessageSquare,
} from "lucide-react"

import { useUser } from "@clerk/clerk-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? ""

  const data = {
    user: {
      email: email,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "ConnectX",
        logo: GalleryVerticalEnd,
        plan: "Made by TOPGs",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: SquareTerminal,
      },
      {
        title: "Announcements",
        url: "/announcements",
        icon: NotebookIcon,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: MessageSquare,
      },  
      {
        title: "Profile",
        url: "/profile",
        icon: User2Icon,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
      },


    ],
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
