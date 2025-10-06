import { apiClient } from "@/lib/api-client";
import {
  COURSES_ENDPOINT,
  COURSE_DETAIL,
  COURSE_DISCUSSIONS,
  COURSE_DISCUSSION_REPLY,
  COURSE_DOUBTS,
  COURSE_LESSON,
  COURSE_LESSONS,
  COURSE_MODULE,
  COURSE_MODULES,
} from "@/utils/constants";
import {
  Course,
  CourseDiscussion,
  CourseLesson,
  CourseModule,
  LessonVideoType,
} from "@/types/course";

export interface FetchCoursesParams {
  createdBy?: string;
  viewerRole?: "teacher" | "student";
  year?: string;
  division?: string;
  search?: string;
}

export interface CreateModulePayload {
  title: string;
  summary?: string;
}

export interface UpdateModulePayload {
  title?: string;
  summary?: string;
}

export interface CreateDiscussionPayload {
  moduleId?: string;
  question: string;
  studentClerkId: string;
  studentName?: string;
  studentEmail?: string;
}

export interface ReplyToDiscussionPayload {
  message: string;
  responderClerkId: string;
  responderRole: "teacher" | "student";
  responderName?: string;
  responderEmail?: string;
  status?: "open" | "answered" | "closed";
}

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

export const fetchCourses = async (params?: FetchCoursesParams): Promise<Course[]> => {
  const response = await apiClient.get(COURSES_ENDPOINT, { params });
  return (response.data?.courses || []) as Course[];
};

export const fetchCourseById = async (courseId: string): Promise<Course> => {
  const response = await apiClient.get(COURSE_DETAIL(courseId));
  return response.data.course as Course;
};

export const createCourse = async (payload: FormData): Promise<Course> => {
  const response = await apiClient.post(COURSES_ENDPOINT, payload, multipartConfig);
  return response.data.course as Course;
};

export const updateCourse = async (courseId: string, payload: FormData): Promise<Course> => {
  const response = await apiClient.patch(COURSE_DETAIL(courseId), payload, multipartConfig);
  return response.data.course as Course;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
  await apiClient.delete(COURSE_DETAIL(courseId));
};

export const addModule = async (courseId: string, payload: CreateModulePayload): Promise<CourseModule> => {
  const response = await apiClient.post(COURSE_MODULES(courseId), payload);
  return response.data.module as CourseModule;
};

export const updateModule = async (
  courseId: string,
  moduleId: string,
  payload: UpdateModulePayload
): Promise<CourseModule> => {
  const response = await apiClient.patch(COURSE_MODULE(courseId, moduleId), payload);
  return response.data.module as CourseModule;
};

export const deleteModule = async (courseId: string, moduleId: string): Promise<void> => {
  await apiClient.delete(COURSE_MODULE(courseId, moduleId));
};

export const addLesson = async (
  courseId: string,
  moduleId: string,
  payload: FormData
): Promise<CourseLesson> => {
  const response = await apiClient.post(COURSE_LESSONS(courseId, moduleId), payload, multipartConfig);
  return response.data.lesson as CourseLesson;
};

export const updateLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
  payload: FormData
): Promise<CourseLesson> => {
  const response = await apiClient.patch(COURSE_LESSON(courseId, moduleId, lessonId), payload, multipartConfig);
  return response.data.lesson as CourseLesson;
};

export const deleteLesson = async (courseId: string, moduleId: string, lessonId: string): Promise<void> => {
  await apiClient.delete(COURSE_LESSON(courseId, moduleId, lessonId));
};

export const fetchLessonDiscussions = async (
  courseId: string,
  lessonId: string
): Promise<CourseDiscussion[]> => {
  const response = await apiClient.get(COURSE_DOUBTS(courseId, lessonId));
  return (response.data?.discussions || []) as CourseDiscussion[];
};

export const createDiscussion = async (
  courseId: string,
  lessonId: string,
  payload: CreateDiscussionPayload
): Promise<CourseDiscussion> => {
  const response = await apiClient.post(COURSE_DOUBTS(courseId, lessonId), payload);
  return response.data.discussion as CourseDiscussion;
};

export const fetchCourseDiscussions = async (
  courseId: string,
  status?: "open" | "answered" | "closed"
): Promise<CourseDiscussion[]> => {
  const response = await apiClient.get(COURSE_DISCUSSIONS(courseId), {
    params: status ? { status } : undefined,
  });
  return (response.data?.discussions || []) as CourseDiscussion[];
};

export const replyToDiscussion = async (
  discussionId: string,
  payload: ReplyToDiscussionPayload
): Promise<{ discussion: CourseDiscussion; message: string }> => {
  const response = await apiClient.post(COURSE_DISCUSSION_REPLY(discussionId), payload);
  return {
    discussion: response.data.discussion as CourseDiscussion,
    message: response.data.message as string,
  };
};

export const buildVideoEmbedUrl = (videoType: LessonVideoType, videoUrl: string) => {
  if (videoType === "youtube") {
    return videoUrl.includes("embed") ? videoUrl : `${videoUrl}`;
  }
  return videoUrl;
};
