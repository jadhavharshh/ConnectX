import { useState, useEffect } from "react"
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
import { Calendar, Clock, Users, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { FETCH_ANNOUNCEMENTS } from "@/utils/constants"
import { toast } from "sonner"

// Define the announcement interface to match backend schema
interface AnnouncementType {
  _id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  author: string;
  date: string;
  imageUrl: string;
  createdAt: string;
}

export default function Announcement() {
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("Setting up announcements fetching...");
    
    // Define the fetch function
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(FETCH_ANNOUNCEMENTS);
        setAnnouncements(response.data.announcements);
        setError(null);
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try again later.");
        toast.error("Could not load announcements");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch immediately when component mounts
    fetchAnnouncements();
    
    // Set up interval for subsequent fetches (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log("Refreshing announcements (5-minute interval)...");
      fetchAnnouncements();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    // Clean up interval on component unmount
    return () => {
      console.log("Cleaning up announcements fetch interval");
      clearInterval(intervalId);
    };
  }, []);
  
  const toggleReadMore = (id: string) => {
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
          
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading announcements...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium">No announcements available at this time.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Announcement */}
              <Card className="overflow-hidden">
                <div className="relative h-64 w-full md:h-80">
                  <img 
                    src={announcements[0].imageUrl} 
                    alt={announcements[0].title}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/800x400?text=Announcement+Image";
                    }}
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
                    {expandedId === announcements[0]._id 
                      ? announcements[0].content 
                      : `${announcements[0].content.slice(0, 200)}...`}
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-2 p-0"
                    onClick={() => toggleReadMore(announcements[0]._id)}
                  >
                    {expandedId === announcements[0]._id ? "Read less" : "Read more"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recent Announcements */}
              {announcements.length > 1 && (
                <div>
                  <h2 className="mb-4 text-lg font-medium">Recent Announcements</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {announcements.slice(1).map((announcement) => (
                      <Card key={announcement._id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img 
                            src={announcement.imageUrl} 
                            alt={announcement.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://placehold.co/800x400?text=Announcement+Image";
                            }}
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
                            {expandedId === announcement._id 
                              ? announcement.content 
                              : `${announcement.content.slice(0, 150)}...`}
                          </p>
                          <Button 
                            variant="link" 
                            className="mt-1 h-auto p-0 text-sm"
                            onClick={() => toggleReadMore(announcement._id)}
                          >
                            {expandedId === announcement._id ? "Read less" : "Read more"}
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
              )}
              
              {/* View More Button - Only show if we have more than 5 announcements */}
              {announcements.length > 5 && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline">View All Announcements</Button>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}