export const HOST = import.meta.env.VITE_BACKEND_URL;
export const AUTH_API = "api/auth";

export const SEND_SIGNUP_DATA = `${AUTH_API}/send-signup-data`;

export const DATA_API = "api/data";
export const FETCH_USER_INFO = `${DATA_API}/fetch-user-info`;
export const CREATE_ANNOUCEMENT = `${DATA_API}/create-announcement`;
export const FETCH_ANNOUNCEMENTS = `${DATA_API}/fetch-announcements`;
export const CREATE_TASKS = `${DATA_API}/create-task`;
export const FETCH_TASKS = `${DATA_API}/fetch-task`;

export const CHAT_API = "api/chat";
export const FETCH_CHAT = `${CHAT_API}/fetch-chats`;
export const FETCH_RECENT_CHATS = `${CHAT_API}/recent`;

// Add these new mentor/mentee API endpoints
export const MENTOR_API = "api/mentor";
export const FETCH_MENTEES = `${MENTOR_API}/fetch-mentees`;
export const ADD_MENTEES = `${MENTOR_API}/add-mentees`;
export const FETCH_MENTEE_DOCUMENTS = `${MENTOR_API}/documents`;

export const MENTEE_API = "api/mentee";
export const FETCH_MENTOR = `${MENTEE_API}/fetch-mentor`;
export const FETCH_DOCUMENT_CATEGORIES = `${MENTEE_API}/document-categories`;
export const FETCH_DOCUMENTS = `${MENTEE_API}/documents`;
export const UPLOAD_DOCUMENT = `${MENTEE_API}/upload-document`;
export const DELETE_DOCUMENT = `${MENTEE_API}/delete-document`;
// Add this to your constants.ts file
export const FETCH_ALL_STUDENTS = `${MENTOR_API}/fetch-all-students`;
export const UPDATE_DOCUMENT_STATUS = `${MENTOR_API}/update-document-status`;

export const COURSES_API = "api/courses";
export const COURSES_ENDPOINT = `${COURSES_API}`;
export const COURSE_DETAIL = (courseId: string) => `${COURSES_API}/${courseId}`;
export const COURSE_MODULES = (courseId: string) => `${COURSES_API}/${courseId}/modules`;
export const COURSE_MODULE = (courseId: string, moduleId: string) => `${COURSES_API}/${courseId}/modules/${moduleId}`;
export const COURSE_LESSONS = (courseId: string, moduleId: string) => `${COURSES_API}/${courseId}/modules/${moduleId}/lessons`;
export const COURSE_LESSON = (courseId: string, moduleId: string, lessonId: string) => `${COURSES_API}/${courseId}/modules/${moduleId}/lessons/${lessonId}`;
export const COURSE_DOUBTS = (courseId: string, lessonId: string) => `${COURSES_API}/${courseId}/lessons/${lessonId}/doubts`;
export const COURSE_DISCUSSIONS = (courseId: string) => `${COURSES_API}/${courseId}/discussions`;
export const COURSE_DISCUSSION_REPLY = (discussionId: string) => `${COURSES_API}/discussions/${discussionId}/reply`;
