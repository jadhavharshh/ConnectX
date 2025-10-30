import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Trash2,
  Video,
  PenSquare,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import {
  addLesson,
  addModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  fetchCourseById,
  replyToDiscussion,
  updateCourse,
  updateLesson,
  updateModule,
  fetchCourseDiscussions,
} from "@/lib/course-api";
import useCourseAccess from "@/hooks/useCourseAccess";
import { Course, CourseDiscussion, CourseLesson, CourseLevel, CourseModule, LessonVideoType, CourseVisibility } from "@/types/course";
import { COURSE_LEVEL_LABELS, COURSE_VISIBILITY_LABELS, formatDateString } from "@/pages/Courses/utils";

interface LessonFormState {
  title: string;
  description: string;
  videoType: LessonVideoType;
  youtubeUrl: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  resourcesText: string;
  duration: string;
  position: string;
  mode: "create" | "edit";
  lessonId?: string;
  originalVideoType?: LessonVideoType;
}

const defaultLessonForm = (): LessonFormState => ({
  title: "",
  description: "",
  videoType: "upload",
  youtubeUrl: "",
  videoFile: null,
  thumbnailFile: null,
  resourcesText: "",
  duration: "",
  position: "",
  mode: "create",
});

const levelOptions: CourseLevel[] = ["beginner", "intermediate", "advanced", "all"];
const visibilityOptions: CourseVisibility[] = ["public", "restricted"];
const academicYears = ["All", "first", "second", "third", "fourth"];

const formatTag = (tag: string) => tag.trim().toLowerCase();

const getLessonCount = (modules: CourseModule[]) =>
  modules.reduce((count, module) => count + module.lessons.length, 0);

const parseResourcesFromText = (resourcesText: string) => {
  const lines = resourcesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const resources = lines
    .map((line) => {
      const [title, url] = line.split("|").map((part) => part.trim());
      if (!url) return null;
      return {
        title: title || url,
        url,
      };
    })
    .filter(Boolean);

  return JSON.stringify(resources);
};

const buildResourcesText = (lesson: CourseLesson) =>
  lesson.resources
    .map((resource) => `${resource.title || resource.url}|${resource.url}`)
    .join("\n");

export default function ManageCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { rawData } = useCourseAccess();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  const [isSavingCourse, setIsSavingCourse] = useState(false);

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleSummary, setModuleSummary] = useState("");
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleEdits, setModuleEdits] = useState<Record<string, { title: string; summary: string }>>({});

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [lessonForms, setLessonForms] = useState<Record<string, LessonFormState>>({});
  const [lessonLoading, setLessonLoading] = useState<Record<string, boolean>>({});

  const [courseDiscussions, setCourseDiscussions] = useState<CourseDiscussion[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);
  const [discussionReplies, setDiscussionReplies] = useState<Record<string, string>>({});

  const totalLessons = useMemo(() => (course ? getLessonCount(course.modules) : 0), [course]);

  const refreshCourse = async (showLoader = true) => {
    if (!courseId) return;
    try {
      if (showLoader) {
        setIsRefreshing(true);
      }
      const fetchedCourse = await fetchCourseById(courseId);
      setCourse(fetchedCourse);
      setTitle(fetchedCourse.title);
      setDescription(fetchedCourse.description);
      setCategory(fetchedCourse.category);
      setLevel(fetchedCourse.level);
      setVisibility(fetchedCourse.visibility);
      setTargetYear(fetchedCourse.targetYear);
      setTargetDivision(fetchedCourse.targetDivision);
      setEstimatedHours(fetchedCourse.estimatedHours ? String(fetchedCourse.estimatedHours) : "");
      setTags((fetchedCourse.tags || []).join(", "));
      setCoverPreview(fetchedCourse.coverImageUrl || "");
    } catch (error: any) {
      console.error("Failed to fetch course", error);
      const message = error?.response?.data?.message || "Failed to load course";
      toast.error(message);
    } finally {
      if (showLoader) {
        setIsRefreshing(false);
      }
      setIsLoading(false);
    }
  };

  const loadDiscussions = async () => {
    if (!courseId) return;
    try {
      setIsLoadingDiscussions(true);
      const discussions = await fetchCourseDiscussions(courseId, "open");
      setCourseDiscussions(discussions);
      setDiscussionReplies({});
    } catch (error) {
      console.error("Failed to load discussions", error);
    } finally {
      setIsLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    refreshCourse();
    loadDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCourseUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!courseId) return;

    try {
      setIsSavingCourse(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("level", level);
      formData.append("visibility", visibility);
      formData.append("targetYear", targetYear);
      formData.append("targetDivision", targetDivision.trim() || "All");
      formData.append("createdByName", rawData?.name || user?.fullName || "");
      formData.append("createdByEmail", rawData?.teacherId || user?.primaryEmailAddress?.emailAddress || "");

      if (estimatedHours) {
        formData.append("estimatedHours", estimatedHours);
      }

      if (tags.trim()) {
        formData.append(
          "tags",
          tags
            .split(",")
            .map((tag) => formatTag(tag))
            .filter(Boolean)
            .join(",")
        );
      } else {
        formData.append("tags", "");
      }

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await updateCourse(courseId, formData);
      toast.success("Course settings updated");
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to update course", error);
      const message = error?.response?.data?.message || "Failed to update course";
      toast.error(message);
    } finally {
      setIsSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseId) return;
    const confirmDelete = window.confirm("This will remove the course, modules, and videos. Continue?");
    if (!confirmDelete) return;

    try {
      await deleteCourse(courseId);
      toast.success("Course deleted");
      navigate("/courses");
    } catch (error: any) {
      console.error("Failed to delete course", error);
      const message = error?.response?.data?.message || "Deletion failed";
      toast.error(message);
    }
  };

  const handleCreateModule = async (event: FormEvent) => {
    event.preventDefault();
    if (!courseId || !moduleTitle.trim()) {
      toast.error("Module title is required");
      return;
    }

    try {
      setIsCreatingModule(true);
      await addModule(courseId, { title: moduleTitle.trim(), summary: moduleSummary.trim() });
      toast.success("Module added");
      setModuleTitle("");
      setModuleSummary("");
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to create module", error);
      const message = error?.response?.data?.message || "Failed to add module";
      toast.error(message);
    } finally {
      setIsCreatingModule(false);
    }
  };

  const startEditingModule = (module: CourseModule) => {
    setEditingModuleId(module._id);
    setModuleEdits((prev) => ({
      ...prev,
      [module._id]: {
        title: module.title,
        summary: module.summary || "",
      },
    }));
  };

  const submitModuleEdit = async (moduleId: string) => {
    if (!courseId) return;
    const edits = moduleEdits[moduleId];
    if (!edits || !edits.title.trim()) {
      toast.error("Module title cannot be empty");
      return;
    }

    try {
      await updateModule(courseId, moduleId, {
        title: edits.title.trim(),
        summary: edits.summary.trim(),
      });
      toast.success("Module updated");
      setEditingModuleId(null);
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to update module", error);
      const message = error?.response?.data?.message || "Failed to update module";
      toast.error(message);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!courseId) return;
    const confirmDelete = window.confirm("Delete this module and all lessons inside it?");
    if (!confirmDelete) return;

    try {
      await deleteModule(courseId, moduleId);
      toast.success("Module removed");
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to delete module", error);
      const message = error?.response?.data?.message || "Failed to delete module";
      toast.error(message);
    }
  };

  const initializeLessonForm = (moduleId: string, lesson?: CourseLesson) => {
    setLessonForms((prev) => ({
      ...prev,
      [moduleId]: lesson
        ? {
            title: lesson.title,
            description: lesson.description || "",
            videoType: lesson.videoType,
            youtubeUrl: lesson.youtubeUrl || "",
            videoFile: null,
            thumbnailFile: null,
            resourcesText: buildResourcesText(lesson),
            duration: lesson.duration ? String(lesson.duration) : "",
            position: String(lesson.position || ""),
            mode: "edit",
            lessonId: lesson._id,
            originalVideoType: lesson.videoType,
          }
        : defaultLessonForm(),
    }));
  };

  const handleLessonInput = (
    moduleId: string,
    field: keyof LessonFormState,
    value: string | File | null
  ) => {
    setLessonForms((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || defaultLessonForm()),
        [field]: value,
      },
    }));
  };

  const submitLessonForm = async (moduleId: string) => {
    if (!courseId) return;
    const formState = lessonForms[moduleId] || defaultLessonForm();

    if (!formState.title.trim()) {
      toast.error("Lesson title is required");
      return;
    }

    if (formState.videoType === "youtube" && !formState.youtubeUrl.trim()) {
      toast.error("Provide a valid YouTube URL");
      return;
    }

    if (formState.videoType === "upload" && !formState.videoFile && formState.mode === "create") {
      toast.error("Upload a video file for this lesson");
      return;
    }

    if (
      formState.mode === "edit" &&
      formState.videoType === "upload" &&
      formState.originalVideoType === "youtube" &&
      !formState.videoFile
    ) {
      toast.error("Upload a video file when switching from YouTube to a local upload");
      return;
    }

    try {
      setLessonLoading((prev) => ({ ...prev, [moduleId]: true }));
      const payload = new FormData();
      payload.append("title", formState.title.trim());
      payload.append("description", formState.description.trim());
      payload.append("videoType", formState.videoType);

      if (formState.videoType === "youtube") {
        payload.append("youtubeUrl", formState.youtubeUrl.trim());
      }

      if (formState.videoFile) {
        payload.append("videoFile", formState.videoFile);
      }

      if (formState.thumbnailFile) {
        payload.append("thumbnail", formState.thumbnailFile);
      }

      if (formState.duration) {
        payload.append("duration", formState.duration);
      }

      if (formState.position) {
        payload.append("position", formState.position);
      }

      if (formState.resourcesText.trim()) {
        payload.append("resources", parseResourcesFromText(formState.resourcesText));
      }

      if (formState.mode === "create") {
        await addLesson(courseId, moduleId, payload);
        toast.success("Lesson added");
      } else if (formState.lessonId) {
        await updateLesson(courseId, moduleId, formState.lessonId, payload);
        toast.success("Lesson updated");
      }

      setExpandedModuleId(null);
      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: defaultLessonForm(),
      }));
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to save lesson", error);
      const message = error?.response?.data?.message || "Lesson save failed";
      toast.error(message);
    } finally {
      setLessonLoading((prev) => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!courseId) return;
    const confirmDelete = window.confirm("Delete this lesson?");
    if (!confirmDelete) return;

    try {
      await deleteLesson(courseId, moduleId, lessonId);
      toast.success("Lesson removed");
      await refreshCourse(false);
    } catch (error: any) {
      console.error("Failed to delete lesson", error);
      const message = error?.response?.data?.message || "Failed to delete lesson";
      toast.error(message);
    }
  };

  const handleDiscussionReply = async (discussion: CourseDiscussion, responseText: string) => {
    if (!responseText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      await replyToDiscussion(discussion._id, {
        message: responseText.trim(),
        responderClerkId: rawData?.clerkUserId || user?.id || "",
        responderRole: "teacher",
        responderName: rawData?.name || user?.fullName || "",
        responderEmail: rawData?.teacherId || user?.primaryEmailAddress?.emailAddress || "",
        status: "answered",
      });
      toast.success("Reply sent");
      await loadDiscussions();
      setDiscussionReplies((prev) => ({ ...prev, [discussion._id]: "" }));
    } catch (error: any) {
      console.error("Failed to reply", error);
      const message = error?.response?.data?.message || "Failed to send reply";
      toast.error(message);
    }
  };

  if (isLoading || !course) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">ConnectX</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Manage Course</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
                  <BreadcrumbLink href="/dashboard">ConnectX</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Manage Course</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {course.category} • {COURSE_LEVEL_LABELS[course.level]} • {COURSE_VISIBILITY_LABELS[course.visibility]}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="secondary" asChild>
                <Link to={`/courses/${course._id}`} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View as Student
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Course
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCourseUpdate} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="course-title">Title</Label>
                      <Input
                        id="course-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input value={category} onChange={(event) => setCategory(event.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Level</Label>
                      <Select value={level} onValueChange={(value: CourseLevel) => setLevel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {COURSE_LEVEL_LABELS[option]}
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
                          {visibilityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {COURSE_VISIBILITY_LABELS[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Estimated Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={estimatedHours}
                        onChange={(event) => setEstimatedHours(event.target.value)}
                      />
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
                        value={targetDivision}
                        onChange={(event) => setTargetDivision(event.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <Input
                      placeholder="Comma separated tags"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cover Image</Label>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="h-24 w-40 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-40 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                          <span>No cover</span>
                        </div>
                      )}
                      <Input type="file" accept="image/*" onChange={handleCoverChange} />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSavingCourse} className="flex items-center gap-2">
                    {isSavingCourse && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium">{formatDateString(course.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Modules</span>
                  <span className="text-sm font-medium">{course.modules.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="text-sm font-medium">{totalLessons}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(course.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {!course.tags?.length && (
                    <span className="text-xs text-muted-foreground">No tags yet</span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshCourse(false)}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  {isRefreshing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDiscussions()}
                  disabled={isLoadingDiscussions}
                  className="flex items-center gap-2"
                >
                  {isLoadingDiscussions && <Loader2 className="h-4 w-4 animate-spin" />}
                  Reload Doubts
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <CardTitle>Modules & Lessons</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Each module can include local videos or YouTube resources. Add lessons to craft the learning path.
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleCreateModule} className="grid gap-4 rounded-lg border p-4 md:grid-cols-[2fr,3fr,auto]">
                <div>
                  <Label htmlFor="module-title">Module title</Label>
                  <Input
                    id="module-title"
                    placeholder="Introduction"
                    value={moduleTitle}
                    onChange={(event) => setModuleTitle(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="module-summary">Summary</Label>
                  <Input
                    id="module-summary"
                    placeholder="What learners will achieve"
                    value={moduleSummary}
                    onChange={(event) => setModuleSummary(event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={isCreatingModule} className="flex w-full items-center gap-2">
                    {isCreatingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add Module
                  </Button>
                </div>
              </form>

              <div className="space-y-4">
                {course.modules.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                    No modules yet. Create your first module to start adding lessons.
                  </div>
                )}

                {course.modules.map((module) => {
                  const formState = lessonForms[module._id] || defaultLessonForm();
                  const isExpanded = expandedModuleId === module._id;
                  const moduleEdit = moduleEdits[module._id];

                  return (
                    <Card key={module._id} className="border border-muted">
                      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          {editingModuleId === module._id ? (
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                              <Input
                                value={moduleEdit?.title || ""}
                                onChange={(event) =>
                                  setModuleEdits((prev) => ({
                                    ...prev,
                                    [module._id]: {
                                      ...(prev[module._id] || { title: "", summary: "" }),
                                      title: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <Input
                                value={moduleEdit?.summary || ""}
                                onChange={(event) =>
                                  setModuleEdits((prev) => ({
                                    ...prev,
                                    [module._id]: {
                                      ...(prev[module._id] || { title: "", summary: "" }),
                                      summary: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => submitModuleEdit(module._id)}>
                                  Save
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setEditingModuleId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-lg font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {module.summary || "No summary provided"}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              initializeLessonForm(module._id);
                              setExpandedModuleId(module._id);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" /> Lesson
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditingModule(module)}
                            className="flex items-center gap-2"
                          >
                            <PenSquare className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteModule(module._id)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {module.lessons.length === 0 ? (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                              No lessons yet.
                            </div>
                          ) : (
                            module.lessons.map((lesson) => (
                              <div
                                key={lesson._id}
                                className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">#{lesson.position}</Badge>
                                    <h4 className="text-base font-semibold">{lesson.title}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {lesson.description || "No description provided"}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Video className="h-3 w-3" />
                                      {lesson.videoType === "upload" ? "Local upload" : "YouTube"}
                                    </span>
                                    {lesson.duration && <Badge variant="secondary">{lesson.duration} min</Badge>}
                                    {lesson.resources.length > 0 && (
                                      <Badge variant="outline">{lesson.resources.length} resources</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      initializeLessonForm(module._id, lesson);
                                      setExpandedModuleId(module._id);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <PenSquare className="h-3 w-3" /> Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteLesson(module._id, lesson._id)}
                                    className="flex items-center gap-2"
                                  >
                                    <Trash2 className="h-3 w-3" /> Delete
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {isExpanded && (
                          <div className="rounded-md border bg-muted/30 p-4">
                            <h4 className="mb-3 text-sm font-semibold">
                              {formState.mode === "create" ? "Add Lesson" : "Edit Lesson"}
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="md:col-span-2">
                                <Label>Lesson Title</Label>
                                <Input
                                  value={formState.title}
                                  onChange={(event) => handleLessonInput(module._id, "title", event.target.value)}
                                  required
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={formState.description}
                                  onChange={(event) => handleLessonInput(module._id, "description", event.target.value)}
                                  rows={3}
                                />
                              </div>
                              <div>
                                <Label>Video Type</Label>
                                <Select
                                  value={formState.videoType}
                                  onValueChange={(value: LessonVideoType) => handleLessonInput(module._id, "videoType", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="upload">Local Upload</SelectItem>
                                    <SelectItem value="youtube">YouTube URL</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Lesson Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.1"
                                  value={formState.duration}
                                  onChange={(event) => handleLessonInput(module._id, "duration", event.target.value)}
                                />
                              </div>
                              {formState.videoType === "youtube" ? (
                                <div className="md:col-span-2">
                                  <Label>YouTube URL</Label>
                                  <Input
                                    placeholder="https://youtube.com/watch?v=..."
                                    value={formState.youtubeUrl}
                                    onChange={(event) => handleLessonInput(module._id, "youtubeUrl", event.target.value)}
                                  />
                                </div>
                              ) : (
                                <div className="md:col-span-2">
                                  <Label>Upload Video</Label>
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(event) =>
                                      handleLessonInput(module._id, "videoFile", event.target.files?.[0] || null)
                                    }
                                  />
                                  <p className="mt-1 text-xs text-muted-foreground">MP4 recommended. Max 500MB.</p>
                                </div>
                              )}
                              <div className="md:col-span-2">
                                <Label>Thumbnail (optional)</Label>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) =>
                                    handleLessonInput(module._id, "thumbnailFile", event.target.files?.[0] || null)
                                  }
                                />
                              </div>
                              <div className="md:col-span-2">
                                <Label>Resources (optional)</Label>
                                <Textarea
                                  placeholder="Title|https://link.com"
                                  value={formState.resourcesText}
                                  onChange={(event) => handleLessonInput(module._id, "resourcesText", event.target.value)}
                                  rows={3}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                  One resource per line, format: Title|https://link
                                </p>
                              </div>
                              <div className="md:col-span-2">
                                <Label>Position</Label>
                                <Input
                                  placeholder="Auto"
                                  value={formState.position}
                                  onChange={(event) => handleLessonInput(module._id, "position", event.target.value)}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Leave blank to append or provide a number to reorder.
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                onClick={() => submitLessonForm(module._id)}
                                disabled={lessonLoading[module._id]}
                                className="flex items-center gap-2"
                                type="button"
                              >
                                {lessonLoading[module._id] && <Loader2 className="h-4 w-4 animate-spin" />}
                                {formState.mode === "create" ? "Add Lesson" : "Save Lesson"}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setExpandedModuleId(null)}
                                type="button"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outstanding Doubts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Respond to student queries to keep learning momentum high.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseDiscussions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No open questions right now.
                </div>
              ) : (
                courseDiscussions.map((discussion) => (
                  <div key={discussion._id} className="rounded-md border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="font-medium">{discussion.question}</h4>
                        <p className="text-xs text-muted-foreground">
                          Asked by {discussion.askedByName || "Student"} • {formatDateString(discussion.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{discussion.status}</Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {discussion.messages.map((message) => (
                        <div key={message._id} className="rounded-md bg-muted/40 p-2">
                          <p className="font-medium text-primary">
                            {message.senderRole === "teacher" ? "You" : message.senderName || "Student"}
                          </p>
                          <p>{message.message}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-start">
                      <Textarea
                        placeholder="Type your reply"
                        value={discussionReplies[discussion._id] || ""}
                        onChange={(event) =>
                          setDiscussionReplies((prev) => ({
                            ...prev,
                            [discussion._id]: event.target.value,
                          }))
                        }
                      />
                      <div className="flex gap-2 md:flex-col">
                        <Button
                          onClick={() =>
                            handleDiscussionReply(
                              discussion,
                              discussionReplies[discussion._id] || ""
                            )
                          }
                          className="md:w-32"
                        >
                          Send Reply
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setDiscussionReplies((prev) => ({
                              ...prev,
                              [discussion._id]: "Thanks for raising this! I will clarify it shortly.",
                            }))
                          }
                          className="md:w-32"
                        >
                          Quick Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
