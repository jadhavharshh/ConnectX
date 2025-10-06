export type CourseVisibility = "public" | "restricted";
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all";
export type LessonVideoType = "upload" | "youtube";
export type DiscussionStatus = "open" | "answered" | "closed";
export type DiscussionSenderRole = "teacher" | "student";

export interface CourseResource {
  title: string;
  url: string;
}

export interface CourseLesson {
  _id: string;
  title: string;
  description?: string;
  videoType: LessonVideoType;
  videoUrl: string;
  youtubeUrl?: string;
  localVideoPath?: string;
  duration?: number;
  thumbnailUrl?: string;
  resources: CourseResource[];
  position: number;
  createdAt: string;
}

export interface CourseModule {
  _id: string;
  title: string;
  summary?: string;
  lessons: CourseLesson[];
  createdAt: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  category: string;
  level: CourseLevel;
  tags: string[];
  estimatedHours?: number;
  createdByClerkId: string;
  createdByName?: string;
  createdByEmail?: string;
  visibility: CourseVisibility;
  targetYear: string;
  targetDivision: string;
  modules: CourseModule[];
  enrolledStudentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionMessage {
  _id: string;
  senderClerkId: string;
  senderRole: DiscussionSenderRole;
  senderName?: string;
  senderEmail?: string;
  message: string;
  createdAt: string;
}

export interface CourseDiscussion {
  _id: string;
  course: string;
  moduleId?: string;
  lessonId: string;
  question: string;
  askedByClerkId: string;
  askedByName?: string;
  askedByEmail?: string;
  status: DiscussionStatus;
  messages: DiscussionMessage[];
  createdAt: string;
  updatedAt: string;
}
