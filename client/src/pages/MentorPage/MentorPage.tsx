import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@clerk/clerk-react";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner"
import useStore from "@/store/store";
import {
    Users,
    Search,
    FileText,
    Download,
    ChevronRight,
    GraduationCap,
    FileUp,
    UserPlus
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ADD_MENTEES, FETCH_ALL_STUDENTS, FETCH_CHAT, FETCH_MENTEES } from "@/utils/constants";

// Define interfaces for our data structures
interface Mentee {
    id: string;
    name: string;
    email: string;
    studentId: string;
    year: string;
    division: string;
    avatarUrl?: string;
    documents: Document[];
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    studentId: string;
    year: string;
    division: string;
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
}

export default function MentorPage() {
    const userData = useStore((state) => state.userData);
    const { user } = useUser();
    const [mentees, setMentees] = useState<Mentee[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isAddingMentees, setIsAddingMentees] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);

    // Fetch mentees and available students
    useEffect(() => {
        fetchData();
    }, []);

    // Replace the fetchData function with this implementation
    // Replace the fetchData function with this implementation
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch all students - using the simplified endpoint
            const studentsResponse = await apiClient.get(FETCH_ALL_STUDENTS);

            if (studentsResponse.data.students) {
                setStudents(studentsResponse.data.students);
                setFilteredStudents(studentsResponse.data.students);
            } else {
                setStudents([]);
                setFilteredStudents([]);
            }

            // 2. Fetch current mentees
            try {
                const menteesResponse = await apiClient.get(FETCH_MENTEES, {
                    params: { mentorId: userData?.data?.id || user?.id }
                });

                if (menteesResponse.data.mentees) {
                    setMentees(menteesResponse.data.mentees);
                } else {
                    setMentees([]);
                }
            } catch (menteeError) {
                console.error("Error fetching mentees:", menteeError);
                toast.error("Failed to fetch mentees");
                setMentees([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch students");
            setStudents([]);
            setFilteredStudents([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Replace the handleAddMentees function with this implementation
    const handleAddMentees = async () => {
        if (selectedStudents.length === 0) {
            toast.error("No students selected");
            return;
        }

        try {
            // Make API call to add mentees
            const response = await apiClient.post(ADD_MENTEES, {
                mentorId: userData?.data?.id || user?.id,
                studentIds: selectedStudents
            });

            if (response.data.success) {
                // Refresh the mentees list
                fetchData();
                setSelectedStudents([]);
                setIsAddingMentees(false);

                toast.success(`Successfully added ${selectedStudents.length} new mentees`);
            } else {
                throw new Error(response.data.message || "Failed to add mentees");
            }
        } catch (error) {
            console.error("Error adding mentees:", error);
            toast.error("Failed to add mentees");
        }
    };

    // Filter students based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredStudents(students);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query) ||
            student.studentId.toLowerCase().includes(query)
        );

        setFilteredStudents(filtered);
    }, [searchQuery, students]);

    // Handle selecting/deselecting a student
    const toggleStudentSelection = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id)
                ? prev.filter(studentId => studentId !== id)
                : [...prev, id]
        );
    };

    // Format file size for display
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get appropriate year label
    const getYearLabel = (yearCode: string) => {
        const yearMap: Record<string, string> = {
            first: "First Year",
            second: "Second Year",
            third: "Third Year",
            fourth: "Fourth Year"
        };

        return yearMap[yearCode] || yearCode;
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">ConnectX</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Mentorship</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Mentor Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your mentees and track their document submissions
                            </p>
                        </div>

                        <Dialog open={isAddingMentees} onOpenChange={setIsAddingMentees}>
                            <DialogTrigger asChild>
                                <Button className="mt-2 md:mt-0" variant="default">
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Mentees
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Mentees</DialogTitle>
                                    <DialogDescription>
                                        Select students to add as your mentees. These students will be able to upload documents and seek guidance from you.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="relative my-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students by name, email or ID..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <ScrollArea className="h-72 pr-4">
                                    {filteredStudents.length > 0 ? (
                                        <div className="space-y-2">
                                            {filteredStudents.map(student => {
                                                // Check if student is already a mentee
                                                const isAlreadyMentee = mentees.some(mentee => mentee.id === student.id);

                                                return (
                                                    <div
                                                        key={student.id}
                                                        className={`flex items-center justify-between p-3 rounded-md border ${isAlreadyMentee ? 'bg-muted/30 opacity-60' : 'hover:bg-accent/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage
                                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                                                                    alt={student.name}
                                                                />
                                                                <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{student.name}</div>
                                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                                    {getYearLabel(student.year)}, Division {student.division}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isAlreadyMentee ? (
                                                            <Badge variant="outline" className="bg-primary/10">Already Added</Badge>
                                                        ) : (
                                                            <Checkbox
                                                                checked={selectedStudents.includes(student.id)}
                                                                onCheckedChange={() => toggleStudentSelection(student.id)}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-8">
                                            <Users className="h-12 w-12 text-muted-foreground opacity-30" />
                                            <h3 className="mt-4 text-lg font-medium">No students found</h3>
                                            <p className="text-sm text-muted-foreground text-center mt-1">
                                                {searchQuery ? 'Try a different search term' : 'There are no available students to add'}
                                            </p>
                                        </div>
                                    )}
                                </ScrollArea>

                                <DialogFooter className="flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">
                                        {selectedStudents.length} student(s) selected
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setIsAddingMentees(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleAddMentees} disabled={selectedStudents.length === 0}>
                                            Add Selected
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Tabs defaultValue="mentees" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="mentees" className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>My Mentees</span>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span>Recent Documents</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="mentees">
                            {mentees.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {mentees.map(mentee => (
                                        <Card key={mentee.id} className="overflow-hidden">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentee.id}`}
                                                                alt={mentee.name}
                                                            />
                                                            <AvatarFallback>{mentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-base">{mentee.name}</CardTitle>
                                                            <CardDescription className="text-xs">
                                                                ID: {mentee.studentId}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {getYearLabel(mentee.year)}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-muted-foreground">Email</div>
                                                        <div className="font-medium truncate max-w-[180px]">{mentee.email}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-muted-foreground">Division</div>
                                                        <div className="font-medium">{mentee.division}</div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-muted-foreground">Documents</div>
                                                        <div className="font-medium">{mentee.documents.length}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="border-t pt-3 pb-3">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-between"
                                                    onClick={() => setSelectedMentee(mentee)}
                                                >
                                                    <span>View Details</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-muted/5">
                                    <Users className="h-12 w-12 text-muted-foreground opacity-30" />
                                    <h3 className="mt-4 text-lg font-medium">No mentees assigned yet</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                                        You don't have any mentees assigned to you yet. Add some students as your mentees to begin mentoring.
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => setIsAddingMentees(true)}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Mentees
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="documents">
                            {mentees.some(mentee => mentee.documents.length > 0) ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-muted/70 px-4 py-3">
                                        <h3 className="font-medium">Recent Document Submissions</h3>
                                    </div>

                                    <div className="divide-y">
                                        {mentees.flatMap(mentee =>
                                            mentee.documents.map(doc => (
                                                <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 p-2 rounded">
                                                            <FileText className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{doc.name}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-3">
                                                                <span>By {mentee.name}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(doc.uploadDate)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" className="gap-1" asChild>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                                <span className="hidden sm:inline">Download</span>
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-muted/5">
                                    <FileUp className="h-12 w-12 text-muted-foreground opacity-30" />
                                    <h3 className="mt-4 text-lg font-medium">No documents uploaded yet</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                                        Your mentees haven't uploaded any documents yet. Documents will appear here once they're submitted.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Mentee Details Dialog */}
                    {selectedMentee && (
                        <Dialog open={!!selectedMentee} onOpenChange={() => setSelectedMentee(null)}>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Mentee Details</DialogTitle>
                                    <DialogDescription>
                                        View information and document submissions for {selectedMentee.name}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-2 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-14 w-14">
                                            <AvatarImage
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMentee.id}`}
                                                alt={selectedMentee.name}
                                            />
                                            <AvatarFallback>{selectedMentee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">{selectedMentee.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {getYearLabel(selectedMentee.year)}, Division {selectedMentee.division}
                                            </p>
                                            <p className="text-sm">{selectedMentee.email}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Documents ({selectedMentee.documents.length})
                                        </h4>

                                        {selectedMentee.documents.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedMentee.documents.map(doc => (
                                                    <div key={doc.id} className="border rounded-md p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-primary/10 p-2 rounded">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{doc.name}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {formatFileSize(doc.size)} • Uploaded on {formatDate(doc.uploadDate)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                    <Download className="h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-muted/10 rounded-md">
                                                <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    No documents uploaded yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedMentee(null)}>
                                        Close
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}