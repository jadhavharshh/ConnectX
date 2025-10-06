import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { toast } from "sonner";
import { Loader2, BookOpen, Layers2, PlusCircle, Search, Video } from "lucide-react";

import useCourseAccess from "@/hooks/useCourseAccess";
import { Course } from "@/types/course";
import { fetchCourses, FetchCoursesParams } from "@/lib/course-api";
import { COURSE_LEVEL_LABELS, COURSE_VISIBILITY_LABELS, formatDateString } from "@/pages/Courses/utils";

const getLessonCount = (course: Course) => course.modules.reduce((acc, module) => acc + module.lessons.length, 0);

export default function Courses() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { role, isTeacher, isStudent, rawData } = useCourseAccess();

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const query = search.toLowerCase();
    return courses.filter((course) => {
      const haystack = [course.title, course.description, course.category, ...(course.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [courses, search]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const params: FetchCoursesParams = {};
        if (isTeacher) {
          const clerkId = rawData?.clerkUserId || user?.id;
          if (clerkId) {
            params.createdBy = clerkId;
          }
        } else if (isStudent) {
          params.viewerRole = "student";
          if (rawData?.year) params.year = rawData.year;
          if (rawData?.division) params.division = rawData.division;
        }
        const fetchedCourses = await fetchCourses(params);
        setCourses(fetchedCourses);
      } catch (error: any) {
        console.error("Failed to load courses", error);
        const message = error?.response?.data?.message || "Unable to fetch courses";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [isTeacher, isStudent, rawData, user?.id]);

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
                  <BreadcrumbPage>Courses</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
              <p className="text-sm text-muted-foreground">
                {isTeacher
                  ? "Design and manage immersive learning journeys for your cohort."
                  : "Access curated modules, lessons, and local videos tailored to you."}
              </p>
            </div>
            {isTeacher && (
              <Button onClick={() => navigate("/courses/create")} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Course
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">No courses found</h2>
                <p className="text-sm text-muted-foreground">
                  {search
                    ? "Try adjusting your search keywords."
                    : isTeacher
                    ? "Start by creating a course to share content with your students."
                    : "Your instructors haven’t assigned a course yet."}
                </p>
              </div>
              {isTeacher && (
                <Button onClick={() => navigate("/courses/create")} className="mt-2 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create your first course
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <Card key={course._id} className="flex flex-col overflow-hidden">
                  <div
                    className="h-40 w-full bg-slate-900/80"
                    style={{
                      backgroundImage: course.coverImageUrl ? `url(${course.coverImageUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{course.category}</Badge>
                      <Badge variant="outline">{COURSE_LEVEL_LABELS[course.level]}</Badge>
                      <Badge variant="outline">{COURSE_VISIBILITY_LABELS[course.visibility]}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers2 className="h-3 w-3" /> {course.modules.length} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> {getLessonCount(course)} lessons
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(course.tags || []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags?.length > 3 && <Badge variant="outline">+{course.tags.length - 3}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDateString(course.updatedAt)}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to={`/courses/${course._id}`}>View Course</Link>
                      </Button>
                      {isTeacher && (
                        <Button asChild variant="outline" className="flex-1">
                          <Link to={`/courses/${course._id}/manage`}>Manage</Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
