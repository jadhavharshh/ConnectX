import { FormEvent, useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { ImagePlus, Loader2, Tags } from "lucide-react";

import { createCourse } from "@/lib/course-api";
import useCourseAccess from "@/hooks/useCourseAccess";
import { CourseLevel, CourseVisibility } from "@/types/course";

const defaultLevels: CourseLevel[] = ["beginner", "intermediate", "advanced", "all"];
const defaultVisibilities: CourseVisibility[] = ["public", "restricted"];
const academicYears = ["All", "first", "second", "third", "fourth"];

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { rawData } = useCourseAccess();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [visibility, setVisibility] = useState<CourseVisibility>("public");
  const [targetYear, setTargetYear] = useState("All");
  const [targetDivision, setTargetDivision] = useState("All");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("General");
    setLevel("beginner");
    setVisibility("public");
    setTargetYear("All");
    setTargetDivision("All");
    setEstimatedHours("");
    setTags("");
    setCoverImage(null);
    setCoverPreview("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (!user?.id) {
      toast.error("User session missing. Please re-authenticate.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("level", level);
      formData.append("visibility", visibility);
      formData.append("targetYear", targetYear);
      formData.append("targetDivision", targetDivision.trim() || "All");
      formData.append("createdByClerkId", rawData?.clerkUserId || user.id);
      formData.append("createdByName", rawData?.name || user.fullName || "");
      formData.append("createdByEmail", rawData?.teacherId || user.primaryEmailAddress?.emailAddress || "");

      if (estimatedHours) {
        formData.append("estimatedHours", estimatedHours);
      }

      if (tags.trim()) {
        formData.append("tags", tags.split(",").map((tag) => tag.trim()).filter(Boolean).join(","));
      }

      if (coverImage) {
        if (coverImage.size > 8 * 1024 * 1024) {
          toast.error("Cover image exceeds 8MB limit");
          setIsSubmitting(false);
          return;
        }
        formData.append("coverImage", coverImage);
      }

      const course = await createCourse(formData);

      toast.success("Course created successfully");
      resetForm();
      navigate(`/courses/${course._id}/manage`);
    } catch (error: any) {
      console.error("Error creating course", error);
      const message = error?.response?.data?.message || "Failed to create course";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
                  <BreadcrumbLink href="/dashboard">ConnectX</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create Course</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create a New Course</h1>
            <p className="text-sm text-muted-foreground">
              Design a structured learning experience with videos, modules, and targeted access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Basics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course-title">Title</Label>
                    <Input
                      id="course-title"
                      placeholder="Enter a compelling course title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-description">Description</Label>
                    <Textarea
                      id="course-description"
                      placeholder="Describe the learning outcomes, structure, and who should take this course"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={6}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g. Data Science"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Estimated Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g. 12"
                        value={estimatedHours}
                        onChange={(event) => setEstimatedHours(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Level</Label>
                      <Select value={level} onValueChange={(value: CourseLevel) => setLevel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultLevels.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item.charAt(0).toUpperCase() + item.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Visibility</Label>
                      <Select value={visibility} onValueChange={(value: CourseVisibility) => setVisibility(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultVisibilities.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item.charAt(0).toUpperCase() + item.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label>Target Year</Label>
                      <Select value={targetYear} onValueChange={setTargetYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((yearOption) => (
                            <SelectItem key={yearOption} value={yearOption}>
                              {yearOption === "All"
                                ? "All Years"
                                : yearOption.charAt(0).toUpperCase() + yearOption.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target Division</Label>
                      <Input
                        placeholder="All"
                        value={targetDivision}
                        onChange={(event) => setTargetDivision(event.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags & Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="course-tags" className="flex items-center gap-2">
                      <Tags className="h-4 w-4" /> Course Tags
                    </Label>
                    <Input
                      id="course-tags"
                      placeholder="Comma separated labels (e.g. ML, Python, Projects)"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tags help students find relevant learning paths and power contextual AI suggestions.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6 text-center">
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Course cover preview"
                        className="h-40 w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                        <ImagePlus className="h-10 w-10" />
                        <span className="text-sm">Upload a thumbnail to highlight your course</span>
                      </div>
                    )}
                    <Input type="file" accept="image/*" onChange={handleCoverChange} />
                    <p className="text-xs text-muted-foreground">
                      Recommended 1280×720 px. PNG or JPG up to 8MB.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Save this course and start adding modules, lessons, and video content. You&apos;ll be able to
                    upload local videos or link YouTube resources on the next screen.
                  </p>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Course
                      </span>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
