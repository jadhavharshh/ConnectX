import { Router } from "express";
import {
  ADD_LESSON,
  ADD_MODULE,
  CREATE_COURSE,
  CREATE_DISCUSSION,
  DELETE_COURSE,
  DELETE_LESSON,
  DELETE_MODULE,
  GET_COURSE,
  LIST_COURSE_DISCUSSIONS,
  LIST_COURSES,
  LIST_LESSON_DISCUSSIONS,
  REPLY_TO_DISCUSSION,
  UPDATE_COURSE,
  UPDATE_LESSON,
  UPDATE_MODULE,
} from "../controllers/CourseController";

const CourseRoutes = Router();

CourseRoutes.post("/", CREATE_COURSE);
CourseRoutes.get("/", LIST_COURSES);

CourseRoutes.post("/discussions/:discussionId/reply", REPLY_TO_DISCUSSION);

CourseRoutes.get("/:courseId/discussions", LIST_COURSE_DISCUSSIONS);
CourseRoutes.post("/:courseId/lessons/:lessonId/doubts", CREATE_DISCUSSION);
CourseRoutes.get("/:courseId/lessons/:lessonId/doubts", LIST_LESSON_DISCUSSIONS);

CourseRoutes.post("/:courseId/modules", ADD_MODULE);
CourseRoutes.patch("/:courseId/modules/:moduleId", UPDATE_MODULE);
CourseRoutes.delete("/:courseId/modules/:moduleId", DELETE_MODULE);

CourseRoutes.post("/:courseId/modules/:moduleId/lessons", ADD_LESSON);
CourseRoutes.patch("/:courseId/modules/:moduleId/lessons/:lessonId", UPDATE_LESSON);
CourseRoutes.delete("/:courseId/modules/:moduleId/lessons/:lessonId", DELETE_LESSON);

CourseRoutes.get("/:courseId", GET_COURSE);
CourseRoutes.patch("/:courseId", UPDATE_COURSE);
CourseRoutes.delete("/:courseId", DELETE_COURSE);

export default CourseRoutes;
