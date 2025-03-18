import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"

// Sample announcement data
const announcements = [
  {
    id: 1,
    title: "Platform Maintenance - Scheduled Downtime",
    date: "March 15, 2025",
    category: "Maintenance",
    image: "https://images.unsplash.com/photo-1600267185393-e158a98703de?w=800&auto=format&fit=crop&q=60",
    content: "We will be performing scheduled maintenance on our systems on Saturday, March 20th from 2:00 AM to 6:00 AM UTC. During this time, ConnectX will be unavailable as we upgrade our infrastructure to improve performance and reliability. We apologize for any inconvenience and appreciate your understanding as we work to enhance your experience. If you have any questions or concerns about this maintenance window, please contact our support team.",
    author: "System Administrator",
    priority: "important"
  },
  {
    id: 2,
    title: "New Feature Release: Advanced Analytics Dashboard",
    date: "March 10, 2025",
    category: "Feature Update",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    content: "We're excited to announce the launch of our Advanced Analytics Dashboard! This powerful new tool provides deeper insights into your data with customizable visualizations, real-time metrics, and enhanced reporting capabilities. To access the new dashboard, navigate to the Analytics section from your main menu. We've also prepared a comprehensive guide to help you get started and make the most of these new features.",
    author: "Product Team",
    priority: "normal"
  },
  {
    id: 3,
    title: "Community Webinar: Best Practices for Data Management",
    date: "March 5, 2025",
    category: "Event",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop&q=60",
    content: "Join us for an informative webinar on data management best practices on March 25th at 11:00 AM UTC. Our panel of experts will discuss strategies for organizing your workspace, implementing effective data governance, and optimizing your workflows. Registration is free for all ConnectX users, but space is limited. Reserve your spot today and submit any questions you'd like addressed during the Q&A session.",
    author: "Events Team",
    priority: "normal"
  }
];

export default function Announcement() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const toggleReadMore = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    ConnectX
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Announcements</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Page Header */}
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
            <p className="text-sm text-muted-foreground">
              Stay updated with the latest news and updates from ConnectX.
            </p>
          </div>
          
          {/* Featured Announcement */}
          <Card className="overflow-hidden">
            <div className="relative h-64 w-full md:h-80">
              <img 
                src={announcements[0].image} 
                alt={announcements[0].title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 p-6">
                  <Badge className={announcements[0].priority === "important" ? "bg-red-500" : "bg-blue-500"}>
                    {announcements[0].category}
                  </Badge>
                  <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{announcements[0].title}</h2>
                  <div className="mt-2 flex items-center text-white/80">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span className="text-sm">{announcements[0].date}</span>
                    <span className="mx-2">•</span>
                    <Users className="mr-1 h-4 w-4" />
                    <span className="text-sm">{announcements[0].author}</span>
                  </div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="leading-relaxed">
                {expandedId === announcements[0].id 
                  ? announcements[0].content 
                  : `${announcements[0].content.slice(0, 200)}...`}
              </p>
              <Button 
                variant="link" 
                className="mt-2 p-0"
                onClick={() => toggleReadMore(announcements[0].id)}
              >
                {expandedId === announcements[0].id ? "Read less" : "Read more"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Recent Announcements */}
          <div>
            <h2 className="mb-4 text-lg font-medium">Recent Announcements</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {announcements.slice(1).map((announcement) => (
                <Card key={announcement.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={announcement.image} 
                      alt={announcement.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={announcement.priority === "important" ? "bg-red-500" : "bg-blue-500"}>
                        {announcement.category}
                      </Badge>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-xs">{announcement.date}</span>
                      </div>
                    </div>
                    <CardTitle className="mt-2">{announcement.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">
                      {expandedId === announcement.id 
                        ? announcement.content 
                        : `${announcement.content.slice(0, 150)}...`}
                    </p>
                    <Button 
                      variant="link" 
                      className="mt-1 h-auto p-0 text-sm"
                      onClick={() => toggleReadMore(announcement.id)}
                    >
                      {expandedId === announcement.id ? "Read less" : "Read more"}
                    </Button>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-1 h-4 w-4" />
                      <span>{announcement.author}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          {/* View More Button */}
          <div className="flex justify-center mt-4">
            <Button variant="outline">View All Announcements</Button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}