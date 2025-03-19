import { useState, ChangeEvent } from "react"
import { format } from "date-fns"
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarIcon, Users, Upload, Clock, CheckSquare, Loader2, Calendar, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { CREATE_TASKS } from "@/utils/constants"

// Add this constant to your project's constants file and import it properly

export default function CreateTasks() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("General")
  const [priority, setPriority] = useState("normal")
  const [dueDate, setDueDate] = useState<Date>()
  const [points, setPoints] = useState("10")
  const [fileAttachment, setFileAttachment] = useState<File | null>(null)
  const [attachmentName, setAttachmentName] = useState("")
  const [assignedYear, setAssignedYear] = useState("None")
  const [assignedDivision, setAssignedDivision] = useState("None")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate assignedTo value for display
  const assignedTo = () => {
    if (assignedYear === "None" && assignedDivision === "None") return "None";
    if (assignedYear === "None") return assignedDivision;
    if (assignedDivision === "None") return assignedYear;
    return `${assignedYear}, ${assignedDivision}`;
  };

  // Current date formatted for display
  const currentDate = format(new Date(), "MMMM d, yyyy")
  const formattedDueDate = dueDate ? format(dueDate, "MMMM d, yyyy") : "No deadline set"

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileAttachment(file)
      setAttachmentName(file.name)
    }
  }

  // Reset form after submission
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSubject("General");
    setPriority("normal");
    setDueDate(undefined);
    setPoints("10");
    setFileAttachment(null);
    setAttachmentName("");
    setAssignedYear("None");
    setAssignedDivision("None");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("subject", subject)
      formData.append("priority", priority)
      formData.append("dueDate", dueDate ? dueDate.toISOString() : "")
      formData.append("points", points)
      formData.append("assignedYear", assignedYear)
      formData.append("assignedDivision", assignedDivision)
      formData.append("createdDate", new Date().toISOString())

      // Append file if available
      if (fileAttachment) {
        // Add file size validation
        if (fileAttachment.size > 25 * 1024 * 1024) { // 25MB limit
          toast.error("File size exceeds 25MB limit")
          setIsSubmitting(false)
          return
        }
        formData.append("attachment", fileAttachment)
      }

      // Make API call with proper content type for multipart data
      const response = await apiClient.post(CREATE_TASKS, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      console.log("Task created:", response.data);
      toast.success("Task created successfully!");
      
      // Reset form after successful submission
      resetForm();
      
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast.error(error.response?.data?.message || "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                  <BreadcrumbPage>Create Task</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
          {/* Page Header */}
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create New Task</h1>
            <p className="text-sm text-muted-foreground">
              Create and assign tasks to students for coursework, assignments, or projects.
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
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter task title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
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
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dueDate"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : "Select due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        placeholder="Enter maximum points"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        type="number"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="assignYear">Assign By Year</Label>
                        <Select
                          value={assignedYear}
                          onValueChange={setAssignedYear}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="All Years">All Years</SelectItem>
                            <SelectItem value="Year 1">Year 1</SelectItem>
                            <SelectItem value="Year 2">Year 2</SelectItem>
                            <SelectItem value="Year 3">Year 3</SelectItem>
                            <SelectItem value="Year 4">Year 4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assignDivision">Assign By Division</Label>
                        <Select
                          value={assignedDivision}
                          onValueChange={setAssignedDivision}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select division" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="All Divisions">All Divisions</SelectItem>
                            <SelectItem value="Division A">Division A</SelectItem>
                            <SelectItem value="Division B">Division B</SelectItem>
                            <SelectItem value="Division C">Division C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select by year, division, or both to target specific student groups.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="attachment"
                        type="file"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      <div className="shrink-0">
                        <Button type="button" variant="outline" size="icon" className="h-10 w-10">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported files: PDF, DOCX, XLSX, Images. Max file size: 25MB.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter detailed task description and instructions"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Task...
                      </>
                    ) : (
                      "Create Task"
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg">
                <Card>
                  <CardHeader className="bg-primary text-white py-4 px-6 rounded-t-lg flex justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        {title || "Task Title"}
                      </h2>
                      <div className="mt-2 flex items-center text-white/80">
                        <GraduationCap className="mr-1 h-4 w-4" />
                        <span className="text-sm">{subject}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="mr-1 h-4 w-4" />
                        <span className="text-sm">Created: {currentDate}</span>
                        <span className="mx-2">•</span>
                        <Clock className="mr-1 h-4 w-4" />
                        <span className="text-sm">Due: {formattedDueDate}</span>
                      </div>
                    </div>
                    <div>
                      <Badge variant={priority === 'high' ? "destructive" : priority === 'normal' ? "secondary" : "outline"}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <div className="mb-6">
                        <p className="leading-relaxed">
                          {description || "Task description will appear here..."}
                        </p>
                      </div>

                      <div className="my-4">
                        <div className="flex justify-between items-center border-t pt-4">
                          <div className="flex items-center">
                            <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Worth: {points} points</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Assigned to: {assignedTo()}</span>
                          </div>
                        </div>
                      </div>

                      {attachmentName && (
                        <div className="mt-4 p-3 border rounded-md flex items-center">
                          <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Attachment: {attachmentName}</span>
                        </div>
                      )}
                    </div>
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