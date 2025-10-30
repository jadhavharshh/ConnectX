import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, CheckSquare, Upload, Users, GraduationCap, Plus, Loader2, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { FETCH_TASKS } from "@/utils/constants"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"

// Define Task interface to match our backend schema
interface Task {
  _id: string;
  title: string;
  description: string;
  subject: string;
  priority: string;
  dueDate: string;
  points: string;
  assignedYear: string;
  assignedDivision: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdDate: string;
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("All")
  const navigate = useNavigate()

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])

  // Function to fetch tasks from API
  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(FETCH_TASKS)
      
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks. Please try again.")
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique subjects for filter dropdown
  const uniqueSubjects = ["All", ...new Set(tasks.map(task => task.subject))]

  // Filter tasks based on search query and subject filter
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === "All" || task.subject === subjectFilter
    
    return matchesSearch && matchesSubject
  })

  // Function to display assigned to text
  const getAssignedText = (task: Task) => {
    if (task.assignedYear === "None" && task.assignedDivision === "None") return "None";
    if (task.assignedYear === "None") return task.assignedDivision;
    if (task.assignedDivision === "None") return task.assignedYear;
    return `${task.assignedYear}, ${task.assignedDivision}`;
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
                  <BreadcrumbPage>Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                View and manage all tasks for your classes
              </p>
            </div>
            <Button onClick={() => navigate("/create-tasks")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative w-full sm:w-2/3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-1/3">
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                // Format dates
                const createdDate = task.createdDate ? format(parseISO(task.createdDate), "MMMM d, yyyy") : "Unknown date";
                const formattedDueDate = task.dueDate ? format(parseISO(task.dueDate), "MMMM d, yyyy") : "No deadline set";
                
                return (
                  <Card key={task._id} className="overflow-hidden">
                    <CardHeader className="bg-primary text-white py-4 px-6 rounded-t-lg flex justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {task.title}
                        </h2>
                        <div className="mt-2 flex items-center text-white/80">
                          <GraduationCap className="mr-1 h-4 w-4" />
                          <span className="text-sm">{task.subject}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="mr-1 h-4 w-4" />
                          <span className="text-sm">Created: {createdDate}</span>
                          <span className="mx-2">•</span>
                          <Clock className="mr-1 h-4 w-4" />
                          <span className="text-sm">Due: {formattedDueDate}</span>
                        </div>
                      </div>
                      <div>
                        <Badge variant={
                          task.priority === 'high' ? "destructive" : 
                          task.priority === 'normal' ? "secondary" : "outline"
                        }>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="prose max-w-none">
                        <div className="mb-6">
                          <p className="leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                        
                        <div className="my-4">
                          <div className="flex justify-between items-center border-t pt-4">
                            <div className="flex items-center">
                              <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Worth: {task.points} points</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Assigned to: {getAssignedText(task)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {task.attachmentName && (
                          <div className="mt-4 p-3 border rounded-md flex items-center">
                            <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                            <a 
                              href={task.attachmentUrl} 
                              className="text-sm text-blue-600 hover:underline"
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              Attachment: {task.attachmentName}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg p-8">
              <p className="text-lg text-muted-foreground mb-4">No tasks found</p>
              <Button onClick={() => navigate("/create-tasks")}>Create your first task</Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}