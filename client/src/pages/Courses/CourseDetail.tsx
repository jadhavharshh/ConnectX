import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";
import { Loader2, MessageCircle, PlayCircle, Video, Youtube, Shield } from "lucide-react";

import {
  COURSE_LEVEL_LABELS,
  COURSE_VISIBILITY_LABELS,
  formatDateString,
} from "@/pages/Courses/utils";
import useCourseAccess from "@/hooks/useCourseAccess";
import {
  Course,
  CourseDiscussion,
  CourseLesson,
  CourseModule,
} from "@/types/course";
import {
  createDiscussion,
  fetchCourseById,
  fetchLessonDiscussions,
} from "@/lib/course-api";

interface DiscussionFormState {
  message: string;
  isSubmitting: boolean;
}

const countLessons = (modules: CourseModule[]) =>
  modules.reduce((total, module) => total + module.lessons.length, 0);

const convertResources = (lesson: CourseLesson) => lesson.resources;

const renderVideoPlayer = (lesson: CourseLesson) => {
  if (lesson.videoType === "youtube") {
    return (
      <iframe
        key={lesson._id}
        src={lesson.videoUrl}
        title={lesson.title}
        className="h-80 w-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <video key={lesson._id} controls className="h-80 w-full rounded-lg" src={lesson.videoUrl}>
      Your browser does not support embedded videos.
    </video>
  );
};

export default function CourseDetail() {
  const { courseId } = useParams();
  const { role, isStudent, rawData } = useCourseAccess();
  const { user } = useUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discussionForm, setDiscussionForm] = useState<DiscussionFormState>({ message: "", isSubmitting: false });
  const [discussions, setDiscussions] = useState<CourseDiscussion[]>([]);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);

  const totalLessons = useMemo(
    () => (course ? countLessons(course.modules) : 0),
    [course]
  );

  const selectLesson = (moduleId: string, lesson: CourseLesson) => {
    setSelectedModuleId(moduleId);
    setSelectedLesson(lesson);
  };

  const loadDiscussions = async (lesson: CourseLesson | null) => {
    if (!course || !lesson) return;
    try {
      setIsLoadingDiscussions(true);
      const fetched = await fetchLessonDiscussions(course._id, lesson._id);
      setDiscussions(fetched);
    } catch (error) {
      console.error("Failed to load discussions", error);
    } finally {
      setIsLoadingDiscussions(false);
    }
  };

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        setIsLoading(true);
        const fetchedCourse = await fetchCourseById(courseId);
        setCourse(fetchedCourse);
        const firstModule = fetchedCourse.modules[0];
        const firstLesson = firstModule?.lessons[0] || null;
        setSelectedModuleId(firstModule?._id || null);
        setSelectedLesson(firstLesson || null);
        await loadDiscussions(firstLesson || null);
      } catch (error: any) {
        console.error("Failed to load course", error);
        const message = error?.response?.data?.message || "Unable to load course";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (selectedLesson) {
      loadDiscussions(selectedLesson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson?._id]);

  const handleSubmitDiscussion = async () => {
    if (!course || !selectedLesson) return;
    if (!discussionForm.message.trim()) {
      toast.error("Please enter your question");
      return;
    }

    try {
      setDiscussionForm((prev) => ({ ...prev, isSubmitting: true }));
      await createDiscussion(course._id, selectedLesson._id, {
        moduleId: selectedModuleId || undefined,
        question: discussionForm.message.trim(),
        studentClerkId: user?.id || rawData?.clerkUserId || "",
        studentName: rawData?.name || user?.fullName || "Student",
        studentEmail: rawData?.email || user?.primaryEmailAddress?.emailAddress || "",
      });
      toast.success("Question submitted");
      setDiscussionForm({ message: "", isSubmitting: false });
      await loadDiscussions(selectedLesson);
    } catch (error: any) {
      console.error("Failed to submit question", error);
      const message = error?.response?.data?.message || "Failed to send question";
      toast.error(message);
      setDiscussionForm((prev) => ({ ...prev, isSubmitting: false }));
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
                    <BreadcrumbPage>Course</BreadcrumbPage>
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{course.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{COURSE_LEVEL_LABELS[course.level]}</Badge>
              <Badge variant="outline">{COURSE_VISIBILITY_LABELS[course.visibility]}</Badge>
              <span>{course.modules.length} modules</span>
              <span>{totalLessons} lessons</span>
              <span>Created {formatDateString(course.createdAt)}</span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[3fr,2fr]">
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 p-4">
                  {selectedLesson ? (
                    <div className="space-y-4">
                      {renderVideoPlayer(selectedLesson)}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" />
                            Lesson {selectedLesson.position}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {selectedLesson.videoType === "upload" ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <Youtube className="h-3 w-3" />
                            )}
                            {selectedLesson.videoType === "upload" ? "Local video" : "YouTube"}
                          </Badge>
                          {selectedLesson.duration && (
                            <Badge variant="outline">{selectedLesson.duration} min</Badge>
                          )}
                        </div>
                        <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {selectedLesson.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                      Select a lesson to start learning.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedLesson && convertResources(selectedLesson).length > 0 ? (
                    convertResources(selectedLesson).map((resource) => (
                      <Button
                        key={resource.url}
                        variant="outline"
                        className="w-full justify-start"
                        asChild
                      >
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No resources shared yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Ask a Doubt</CardTitle>
                    <MessageCircle className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stuck on something? Share your question with the instructor and get clarification.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isStudent ? (
                    <div className="space-y-3">
                      <Label htmlFor="doubt">Your Question</Label>
                      <Textarea
                        id="doubt"
                        rows={4}
                        placeholder="Explain where you're stuck or what needs clarification"
                        value={discussionForm.message}
                        onChange={(event) =>
                          setDiscussionForm((prev) => ({ ...prev, message: event.target.value }))
                        }
                      />
                      <Button
                        onClick={handleSubmitDiscussion}
                        disabled={discussionForm.isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {discussionForm.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Question
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Teachers view and respond to doubts from the course management dashboard.
                    </p>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Recent Discussion</h3>
                    {isLoadingDiscussions ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading doubts...
                      </div>
                    ) : discussions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No questions yet for this lesson.</p>
                    ) : (
                      <div className="space-y-3">
                        {discussions.map((discussion) => (
                          <div key={discussion._id} className="rounded-md border p-3">
                            <p className="text-sm font-medium">{discussion.question}</p>
                            <p className="text-xs text-muted-foreground">
                              {discussion.askedByName || "Student"} • {formatDateString(discussion.createdAt)}
                            </p>
                            <div className="mt-2 space-y-2">
                              {discussion.messages
                                .filter((message) => message.senderRole === "teacher")
                                .map((message) => (
                                  <div key={message._id} className="rounded-md bg-muted/40 p-2 text-sm">
                                    <p className="font-medium text-primary">Instructor</p>
                                    <p>{message.message}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Outline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-[520px] pr-2">
                    <div className="space-y-4">
                      {course.modules.map((module) => (
                        <div key={module._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{module.title}</h3>
                            <Badge variant="outline">{module.lessons.length} lessons</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {module.summary || "No summary"}
                          </p>
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => {
                              const isActive = selectedLesson?._id === lesson._id;
                              return (
                                <Button
                                  key={lesson._id}
                                  variant={isActive ? "secondary" : "outline"}
                                  className="w-full justify-start text-left"
                                  onClick={() => selectLesson(module._id, lesson)}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium">{lesson.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      Lesson {lesson.position} • {lesson.videoType === "upload" ? "Local" : "YouTube"}
                                    </span>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Course Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>{COURSE_VISIBILITY_LABELS[course.visibility]} course</span>
                  </div>
                  <div>
                    <span className="font-medium">Target Year:</span> {course.targetYear}
                  </div>
                  <div>
                    <span className="font-medium">Target Division:</span> {course.targetDivision}
                  </div>
                  {course.estimatedHours && (
                    <div>
                      <span className="font-medium">Estimated workload:</span> {course.estimatedHours} hours
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="font-medium">Tags</span>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.length ? (
                        course.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs">No tags yet</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
