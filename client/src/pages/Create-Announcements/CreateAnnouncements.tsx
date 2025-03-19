import React, { useState, ChangeEvent } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Upload } from "lucide-react"
import { format } from "date-fns"

export default function CreateAnnouncements() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1600267185393-e158a98703de?w=800&auto=format&fit=crop&q=60")
  const [category, setCategory] = useState("Maintenance")
  const [priority, setPriority] = useState("normal")
  const [author, setAuthor] = useState("")
  
  // Current date formatted for display
  const currentDate = format(new Date(), "MMMM d, yyyy")

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a URL for the uploaded file
      const fileUrl = URL.createObjectURL(file)
      setImageUrl(fileUrl)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you can call your backend API to create an announcement
    console.log("Form Data", { 
      title, 
      content, 
      imageUrl, 
      category, 
      priority,
      author,
      date: currentDate
    })
    // In a real implementation, you would use FormData to upload the image file
  }

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
                  <BreadcrumbPage>Create Announcement</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Page Header */}
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create New Announcement</h1>
            <p className="text-sm text-muted-foreground">
              Create and publish a new announcement to share updates with your team.
            </p>
          </div>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="edit">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter announcement title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Feature Update">Feature Update</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="important">Important</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="cursor-pointer"
                      />
                      <div className="shrink-0">
                        <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended size: 1200x600px. Max file size: 5MB.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Enter announcement content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[280px]"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Publish Announcement</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Preview</h2>
                
                <Card className="overflow-hidden">
                  <div className="relative h-64 w-full">
                    <img 
                      src={imageUrl || "https://placehold.co/800x400?text=No+Image+Selected"} 
                      alt={title || "Announcement Preview"}
                      className="absolute inset-0 h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/800x400?text=Invalid+Image+URL";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                      <div className="absolute bottom-0 p-6">
                        <Badge className={priority === "important" ? "bg-red-500" : "bg-blue-500"}>
                          {category}
                        </Badge>
                        <h2 className="mt-2 text-2xl font-bold text-white">
                          {title || "Announcement Title"}
                        </h2>
                        <div className="mt-2 flex items-center text-white/80">
                          <Calendar className="mr-1 h-4 w-4" />
                          <span className="text-sm">{currentDate}</span>
                          {author && (
                            <>
                              <span className="mx-2">•</span>
                              <Users className="mr-1 h-4 w-4" />
                              <span className="text-sm">{author}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="leading-relaxed">
                      {content || "Announcement content will appear here..."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}