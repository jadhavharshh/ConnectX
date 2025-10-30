import { CourseLevel, CourseVisibility } from "@/types/course";

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All Levels",
};

export const COURSE_VISIBILITY_LABELS: Record<CourseVisibility, string> = {
  public: "Public",
  restricted: "Restricted",
};

export const formatDateString = (isoString: string) => {
  if (!isoString) return "-";
  try {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(isoString));
  } catch (error) {
    return "-";
  }
};
