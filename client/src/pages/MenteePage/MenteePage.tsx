import { useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import useStore from "@/store/store";
import {
    User,
    Users,
    FileText,
    Download,
    Trash2,
    Upload,
    GraduationCap,
    BookOpen,
    File,
    FilePlus2,
    FileUp,
    Loader2,
    AlertCircle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { DELETE_DOCUMENT, FETCH_DOCUMENT_CATEGORIES, FETCH_DOCUMENTS, FETCH_MENTOR, UPLOAD_DOCUMENT } from "@/utils/constants";

// Define interfaces for our data structures
interface Mentor {
    id: string;
    name: string;
    email: string;
    department: string;
    avatarUrl?: string;
}

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadDate: string;
    url: string;
    status: "pending" | "approved" | "rejected";
}

interface DocumentCategory {
    id: string;
    name: string;
    required: boolean;
    description: string;
}

export default function MenteePage() {
    const { user } = useUser();
    const userData = useStore((state) => state.userData);

    const [mentor, setMentor] = useState<Mentor | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [documentName, setDocumentName] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isAddingDocument, setIsAddingDocument] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch mentor and document data
    useEffect(() => {
        fetchData();
    }, []);
    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);

            // If no document name is set, use the file name (without extension)
            if (!documentName) {
                const fileName = e.target.files[0].name;
                const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
                setDocumentName(nameWithoutExtension || fileName);
            }
        }
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Replace the fetchData function with this implementation
    const fetchData = async () => {
        try {
            setIsLoading(true);
            // Update these lines in the fetchData function
            const mentorResponse = await apiClient.get(FETCH_MENTOR, {
                params: { studentId: userData?.data?.id || user?.id }
            });

            if (mentorResponse.data.mentor) {
                setMentor(mentorResponse.data.mentor);
            } else {
                setMentor(null);
            }

            // 2. Fetch document categories
            const categoriesResponse = await apiClient.get(FETCH_DOCUMENT_CATEGORIES);

            if (categoriesResponse.data.categories) {
                setDocumentCategories(categoriesResponse.data.categories);
            } else {
                setDocumentCategories([]);
            }

            // 3. Fetch student's documents
            const documentsResponse = await apiClient.get(FETCH_DOCUMENTS, {
                params: { studentId: userData?.data?.id || user?.id }
            });

            if (documentsResponse.data.documents) {
                setDocuments(documentsResponse.data.documents);
            } else {
                setDocuments([]);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load mentee data");
        } finally {
            setIsLoading(false);
        }
    };

    // Replace the handleUploadDocument function with this implementation
    const handleUploadDocument = async () => {
        if (!selectedCategory || !documentName || !file) {
            toast.error("Missing Information");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('documentName', documentName);
            formData.append('categoryId', selectedCategory);
            formData.append('studentId', userData?.data?.id || user?.id || '');

            // Setup progress tracking
            const config = {
                onUploadProgress: (progressEvent: any) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };

            // Make API call to upload document
            const response = await apiClient.post(UPLOAD_DOCUMENT, formData, config);

            if (response.data.success) {
                // Add the new document to the list
                const newDocument = response.data.document;
                setDocuments(prev => [newDocument, ...prev]);

                // Reset form
                setDocumentName("");
                setSelectedCategory("");
                setFile(null);
                setIsAddingDocument(false);

                toast.success("Document uploaded successfully");
            } else {
                throw new Error(response.data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            toast.error("File upload failed");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Replace the handleDeleteDocument function with this implementation
    const handleDeleteDocument = async (documentId: string) => {
        try {
            // Make API call to delete document
            const response = await apiClient.delete(DELETE_DOCUMENT, {
                data: { documentId }
            });

            if (response.data.success) {
                // Remove the document from the list
                setDocuments(prev => prev.filter(doc => doc.id !== documentId));
                toast.success("Document deleted successfully");
            } else {
                throw new Error(response.data.message || "Deletion failed");
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            toast.error("Deletion failed");
        }
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

    // Get status badge variant
    const getStatusBadge = (status: Document['status']) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
            case 'pending':
            default:
                return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
        }
    };

    // Get completion status
    const getCompletionStatus = () => {
        const requiredCategories = documentCategories.filter(cat => cat.required);
        if (requiredCategories.length === 0) return 100;

        // Get unique categories from uploaded documents
        const uploadedCategories = new Set<string>();
        documents.forEach(doc => {
            if (doc.status !== 'rejected') {
                // In a real app, each document would have a category field
                // For now, we'll assume each document has a distinct category
                uploadedCategories.add(doc.id.split('-')[0]);
            }
        });

        // Calculate completion percentage
        const uploaded = Math.min(uploadedCategories.size, requiredCategories.length);
        return Math.round((uploaded / requiredCategories.length) * 100);
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
                    <div className="flex flex-col gap-4">
                        {/* Mentee Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Your Mentorship Portal</h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage your documents and stay connected with your mentor
                                </p>
                            </div>

                            <Dialog open={isAddingDocument} onOpenChange={setIsAddingDocument}>
                                <DialogTrigger asChild>
                                    <Button className="mt-2 md:mt-0">
                                        <FilePlus2 className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Upload New Document</DialogTitle>
                                        <DialogDescription>
                                            Submit a new document for your mentor's review. Supported formats include PDF, DOC, DOCX, JPG, and PNG.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="space-y-4 py-2">
                                        <div className="grid w-full gap-1.5">
                                            <Label htmlFor="category">Document Category</Label>
                                            <Select
                                                value={selectedCategory}
                                                onValueChange={setSelectedCategory}
                                            >
                                                <SelectTrigger id="category">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {documentCategories.map(category => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name} {category.required && " (Required)"}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedCategory && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {documentCategories.find(c => c.id === selectedCategory)?.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid w-full gap-1.5">
                                            <Label htmlFor="documentName">Document Name</Label>
                                            <Input
                                                id="documentName"
                                                value={documentName}
                                                onChange={(e) => setDocumentName(e.target.value)}
                                                placeholder="e.g., First Semester Marksheet"
                                            />
                                        </div>

                                        <div className="grid w-full gap-1.5">
                                            <Label htmlFor="file">File</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={fileInputRef}
                                                    id="file"
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    className="flex-1"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Max file size: 10MB. Accepted formats: PDF, DOC, DOCX, JPG, PNG.
                                            </p>
                                        </div>

                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>Uploading...</span>
                                                    <span>{Math.round(uploadProgress)}%</span>
                                                </div>
                                                <Progress value={uploadProgress} />
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddingDocument(false)} disabled={isUploading}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleUploadDocument}
                                            disabled={!selectedCategory || !documentName || !file || isUploading}
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Mentor Card */}
                        {mentor ? (
                            <Card className="border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Your Mentor</CardTitle>
                                    <CardDescription>Details about your assigned mentor</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage
                                                src={mentor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.id}`}
                                                alt={mentor.name}
                                            />
                                            <AvatarFallback>{mentor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-lg font-semibold">{mentor.name}</h3>
                                            <p className="text-sm text-muted-foreground">{mentor.department}</p>
                                            <p className="text-sm">{mentor.email}</p>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/50 py-3">
                                    <div className="w-full">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Document Completion
                                            </span>
                                            <span>{getCompletionStatus()}%</span>
                                        </div>
                                        <Progress value={getCompletionStatus()} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {getCompletionStatus() < 100
                                                ? "Upload all required documents to complete your profile"
                                                : "All required documents have been uploaded"}
                                        </p>
                                    </div>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card className="border">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Mentor Assignment</CardTitle>
                                    <CardDescription>You don't have a mentor assigned yet</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <User className="h-12 w-12 text-muted-foreground opacity-30" />
                                    <h3 className="mt-4 text-lg font-medium">No Mentor Assigned</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                                        You haven't been assigned a mentor yet. Your program coordinator will assign one to you soon.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Documents Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold tracking-tight">Your Documents</h2>
                                <Button variant="ghost" size="sm" onClick={fetchData}>
                                    Refresh
                                </Button>
                            </div>

                            {documents.length > 0 ? (
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="bg-muted/70 px-4 py-3 flex items-center justify-between">
                                        <h3 className="font-medium">Uploaded Documents</h3>
                                        <Badge variant="outline" className="font-mono">
                                            {documents.length} {documents.length === 1 ? 'file' : 'files'}
                                        </Badge>
                                    </div>

                                    <div className="divide-y">
                                        {documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/10">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-primary/10 p-2 rounded">
                                                        <FileText className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {doc.name}
                                                            {getStatusBadge(doc.status)}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatFileSize(doc.size)} • Uploaded on {formatDate(doc.uploadDate)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Download</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this document? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center border rounded-lg p-8 bg-muted/5">
                                    <FileUp className="h-12 w-12 text-muted-foreground opacity-30" />
                                    <h3 className="mt-4 text-lg font-medium">No documents uploaded</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1 max-w-md">
                                        You haven't uploaded any documents yet. Click the "Upload Document" button to add your first document.
                                    </p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => setIsAddingDocument(true)}
                                    >
                                        <FilePlus2 className="h-4 w-4 mr-2" />
                                        Upload Document
                                    </Button>
                                </div>
                            )}

                            {/* Document Categories */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/70 px-4 py-3">
                                    <h3 className="font-medium">Required Document Categories</h3>
                                </div>

                                <div className="divide-y">
                                    {documentCategories.map(category => (
                                        <div key={category.id} className="flex items-center justify-between p-4 hover:bg-muted/10">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded ${category.required ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                                                    <BookOpen className={`h-5 w-5 ${category.required ? 'text-red-500' : 'text-blue-500'}`} />
                                                </div>
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        {category.name}
                                                        {category.required && (
                                                            <Badge variant="secondary" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {category.description}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedCategory(category.id);
                                                    setIsAddingDocument(true);
                                                }}
                                            >
                                                Upload
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}