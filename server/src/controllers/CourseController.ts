import { Request, Response, NextFunction, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Course, { ICourse, ICourseModule, ICourseLesson, ICourseResource } from "../models/CourseSchema";
import CourseDiscussion from "../models/CourseDiscussionSchema";
import { notifyCourseChange } from "../services/emailService";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  };
}

const ensureDirectory = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const buildUploadsPath = (...segments: string[]) =>
  path.join(__dirname, "../../public/uploads", ...segments);

const buildPublicUrl = (req: Request, folder: string, filename: string) =>
  `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;

const parseStringArray = (value?: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map(String);
      }
    } catch (error) {
      // Not JSON, fall back to comma-separated parsing
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const parseResources = (value?: any): ICourseResource[] => {
  if (!value) return [];

  let resources: any = value;
  if (typeof value === "string") {
    try {
      resources = JSON.parse(value);
    } catch (error) {
      // Allow semicolon-separated pairs like "Title|url;Title2|url2"
      const pairs = value.split(";").map((item) => item.trim()).filter(Boolean);
      return pairs
        .map((pair) => {
          const [title, url] = pair.split("|").map((item) => item.trim());
          if (!url) return null;
          return {
            title: title || url,
            url,
          } as ICourseResource;
        })
        .filter(Boolean) as ICourseResource[];
    }
  }

  if (!Array.isArray(resources)) return [];

  return resources
    .map((resource) => {
      if (!resource) return null;

      if (typeof resource === "string") {
        return {
          title: resource,
          url: resource,
        } as ICourseResource;
      }

      const url = resource.url || resource.link;
      if (!url) return null;

      const title = resource.title || resource.name || resource.label || url;

      return {
        title,
        url,
      } as ICourseResource;
    })
    .filter(Boolean) as ICourseResource[];
};

const extractYoutubeId = (url: string): string | null => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0] || null;
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    const pathname = parsed.pathname;

    const patterns = [
      /\/embed\/([\w-]{11})/,
      /\/v\/([\w-]{11})/,
      /\/shorts\/([\w-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    // Ignore invalid URL parsing
  }

  const looseMatch = url.match(/([\w-]{11})/);
  if (looseMatch) {
    return looseMatch[1];
  }

  return null;
};

const normalizeYoutubeUrls = (url: string): { watch: string; embed: string } | null => {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  return {
    watch: `https://www.youtube.com/watch?v=${videoId}`,
    embed: `https://www.youtube.com/embed/${videoId}`,
  };
};

const removeFileIfExists = (filePath?: string | null) => {
  if (!filePath) return;
  fs.stat(filePath, (statError) => {
    if (statError) return;
    fs.unlink(filePath, (unlinkError) => {
      if (unlinkError) {
        console.error("Failed to remove file", unlinkError);
      }
    });
  });
};

const recalculateLessonPositions = (module: ICourseModule) => {
  module.lessons.forEach((lesson, index) => {
    lesson.position = index + 1;
  });
};

const getLessonDocumentArray = (
  module: ICourseModule
): mongoose.Types.DocumentArray<ICourseLesson> => {
  return module.lessons as unknown as mongoose.Types.DocumentArray<ICourseLesson>;
};

const courseCoverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = buildUploadsPath("course-covers");
    ensureDirectory(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `course-cover-${uniqueSuffix}${ext}`);
  },
});

const courseCoverUpload = multer({
  storage: courseCoverStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for course cover images."));
    }
  },
}).single("coverImage");

const lessonMediaStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const folder = file.fieldname === "videoFile" ? "course-videos" : "course-thumbnails";
    const dir = buildUploadsPath(folder);
    ensureDirectory(dir);
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === "videoFile" ? "lesson-video" : "lesson-thumbnail";
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

const lessonUpload = multer({
  storage: lessonMediaStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "videoFile") {
      if (file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only video files are allowed for lesson uploads."));
      }
      return;
    }

    if (file.fieldname === "thumbnail") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for lesson thumbnails."));
      }
      return;
    }

    cb(null, true);
  },
}).fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const parseInitialModules = (rawModules: any): Partial<ICourseModule>[] => {
  if (!rawModules) return [];

  let modulesSource: any = rawModules;
  if (typeof rawModules === "string") {
    try {
      modulesSource = JSON.parse(rawModules);
    } catch (error) {
      console.warn("Unable to parse modules JSON. Ignoring initial modules.");
      return [];
    }
  }

  if (!Array.isArray(modulesSource)) return [];

  return modulesSource
    .map((module: any) => {
      if (!module || !module.title) return null;

      const lessons = Array.isArray(module.lessons)
        ? module.lessons
            .map((lesson: any, index: number) => {
              if (!lesson || !lesson.title || !lesson.videoType) return null;

              if (lesson.videoType === "youtube" && lesson.videoUrl) {
                const normalized = normalizeYoutubeUrls(lesson.videoUrl || lesson.youtubeUrl || "");
                if (!normalized) return null;

                return {
                  title: lesson.title,
                  description: lesson.description || "",
                  videoType: "youtube" as const,
                  videoUrl: normalized.embed,
                  youtubeUrl: normalized.watch,
                  duration: lesson.duration ? Number(lesson.duration) : undefined,
                  resources: parseResources(lesson.resources),
                  position: index + 1,
                } as Partial<ICourseLesson>;
              }

              return null;
            })
            .filter(Boolean)
        : [];

      return {
        title: module.title,
        summary: module.summary || "",
        lessons,
      } as Partial<ICourseModule>;
    })
    .filter(Boolean) as Partial<ICourseModule>[];
};

export const CREATE_COURSE = (request: Request, response: Response, _next: NextFunction) => {
  courseCoverUpload(request, response, async (err) => {
    if (err instanceof multer.MulterError) {
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    }

    if (err) {
      response.status(400).json({ message: err.message });
      return;
    }

    try {
      const {
        title,
        description,
        category,
        level,
        visibility,
        targetYear,
        targetDivision,
        estimatedHours,
        createdByClerkId,
        createdByName,
        createdByEmail,
        tags,
        modules,
      } = request.body;

      if (!title || !description || !createdByClerkId) {
        response.status(400).json({ message: "Missing required fields" });
        return;
      }

      const courseData: Partial<ICourse> = {
        title,
        description,
        category: category || "General",
        level: (level as ICourse["level"]) || "beginner",
        visibility: (visibility as ICourse["visibility"]) || "public",
        targetYear: targetYear || "All",
        targetDivision: targetDivision || "All",
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        createdByClerkId,
        createdByName,
        createdByEmail,
        tags: parseStringArray(tags),
      } as Partial<ICourse>;

      if (request.file) {
        const coverImageUrl = buildPublicUrl(request, "course-covers", request.file.filename);
        courseData.coverImageUrl = coverImageUrl;
        courseData.coverImagePath = request.file.path;
      }

      const initialModules = parseInitialModules(modules);
      if (initialModules.length) {
        courseData.modules = initialModules as ICourseModule[];
      }

      const course = await Course.create(courseData);

      response.status(201).json({
        message: "Course created successfully",
        course,
      });

      notifyCourseChange({
        course,
        action: "course-created",
        performedBy: createdByName || createdByEmail,
      }).catch((error) => {
        console.error("Failed to trigger course creation notification", error);
      });
    } catch (error: any) {
      console.error("Error creating course", error);
      response.status(500).json({ message: "Failed to create course", error: error.message });
    }
  });
};

export const LIST_COURSES = async (request: Request, response: Response) => {
  try {
    const { createdBy, viewerRole, year, division, search } = request.query;

    const filter: any = {};

    if (createdBy) {
      filter.createdByClerkId = createdBy;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (viewerRole === "student") {
      const yearValue = (year as string) || "All";
      const divisionValue = (division as string) || "All";

      const yearClauses = [{ targetYear: "All" }];
      const divisionClauses = [{ targetDivision: "All" }];

      if (yearValue && yearValue !== "All") {
        yearClauses.push({ targetYear: yearValue });
      }

      if (divisionValue && divisionValue !== "All") {
        divisionClauses.push({ targetDivision: divisionValue });
      }

      filter.$or = [
        { visibility: "public" },
        {
          visibility: "restricted",
          $and: [{ $or: yearClauses }, { $or: divisionClauses }],
        },
      ];
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });

    response.status(200).json({ courses });
  } catch (error: any) {
    console.error("Error listing courses", error);
    response.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

export const GET_COURSE = async (request: Request, response: Response) => {
  try {
    const { courseId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      response.status(400).json({ message: "Invalid course id" });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    response.status(200).json({ course });
  } catch (error: any) {
    console.error("Error fetching course", error);
    response.status(500).json({ message: "Failed to fetch course", error: error.message });
  }
};

export const UPDATE_COURSE = (request: Request, response: Response, _next: NextFunction) => {
  courseCoverUpload(request, response, async (err) => {
    if (err instanceof multer.MulterError) {
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    }

    if (err) {
      response.status(400).json({ message: err.message });
      return;
    }

    try {
      const { courseId } = request.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        response.status(400).json({ message: "Invalid course id" });
        return;
      }

      const course = await Course.findById(courseId);

      if (!course) {
        response.status(404).json({ message: "Course not found" });
        return;
      }

      const {
        title,
        description,
        category,
        level,
        visibility,
        targetYear,
        targetDivision,
        estimatedHours,
        tags,
        createdByName,
        createdByEmail,
      } = request.body;

      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (category !== undefined) course.category = category;
      if (level !== undefined) course.level = level;
      if (visibility !== undefined) course.visibility = visibility;
      if (targetYear !== undefined) course.targetYear = targetYear;
      if (targetDivision !== undefined) course.targetDivision = targetDivision;
      if (estimatedHours !== undefined) {
        course.estimatedHours = estimatedHours ? Number(estimatedHours) : undefined;
      }
      if (tags !== undefined) course.tags = parseStringArray(tags);
      if (createdByName !== undefined) course.createdByName = createdByName;
      if (createdByEmail !== undefined) course.createdByEmail = createdByEmail;

      if (request.file) {
        removeFileIfExists(course.coverImagePath);
        course.coverImageUrl = buildPublicUrl(request, "course-covers", request.file.filename);
        course.coverImagePath = request.file.path;
      }

      await course.save();

      response.status(200).json({ message: "Course updated successfully", course });

      notifyCourseChange({
        course,
        action: "course-updated",
        performedBy: createdByName || createdByEmail || course.createdByName,
      }).catch((error) => {
        console.error("Failed to trigger course update notification", error);
      });
    } catch (error: any) {
      console.error("Error updating course", error);
      response.status(500).json({ message: "Failed to update course", error: error.message });
    }
  });
};

export const DELETE_COURSE = async (request: Request, response: Response) => {
  try {
    const { courseId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      response.status(400).json({ message: "Invalid course id" });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    course.modules.forEach((module: ICourseModule) => {
      module.lessons.forEach((lesson: ICourseLesson) => {
        if (lesson.videoType === "upload") {
          removeFileIfExists(lesson.localVideoPath);
        }
        removeFileIfExists(lesson.thumbnailPath);
      });
    });

    removeFileIfExists(course.coverImagePath);

    await course.deleteOne();

    await CourseDiscussion.deleteMany({ course: course._id });

    response.status(200).json({ message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course", error);
    response.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

export const ADD_MODULE = async (request: Request, response: Response) => {
  try {
    const { courseId } = request.params;
    const { title, summary } = request.body;

    if (!title) {
      response.status(400).json({ message: "Module title is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      response.status(400).json({ message: "Invalid course id" });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    const newModule = {
      title,
      summary,
      lessons: [],
    } as unknown as ICourseModule;

    course.modules.push(newModule);
    await course.save();

    const createdModule = course.modules[course.modules.length - 1];

    response.status(201).json({
      message: "Module added successfully",
      module: createdModule,
    });

    notifyCourseChange({
      course,
      action: "module-added",
      module: createdModule,
      performedBy: course.createdByName,
    }).catch((error) => {
      console.error("Failed to trigger course module notification", error);
    });
  } catch (error: any) {
    console.error("Error adding module", error);
    response.status(500).json({ message: "Failed to add module", error: error.message });
  }
};

export const UPDATE_MODULE = async (request: Request, response: Response) => {
  try {
    const { courseId, moduleId } = request.params;
    const { title, summary } = request.body;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(moduleId)) {
      response.status(400).json({ message: "Invalid identifiers" });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    const module = course.modules.id(moduleId as any);

    if (!module) {
      response.status(404).json({ message: "Module not found" });
      return;
    }

    if (title !== undefined) module.title = title;
    if (summary !== undefined) module.summary = summary;

    await course.save();

    response.status(200).json({ message: "Module updated successfully", module });
  } catch (error: any) {
    console.error("Error updating module", error);
    response.status(500).json({ message: "Failed to update module", error: error.message });
  }
};

export const DELETE_MODULE = async (request: Request, response: Response) => {
  try {
    const { courseId, moduleId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(moduleId)) {
      response.status(400).json({ message: "Invalid identifiers" });
      return;
    }

    const course = await Course.findById(courseId);

    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    const module = course.modules.id(moduleId as any);

    if (!module) {
      response.status(404).json({ message: "Module not found" });
      return;
    }

    module.lessons.forEach((lesson: ICourseLesson) => {
      if (lesson.videoType === "upload") {
        removeFileIfExists(lesson.localVideoPath);
      }
      removeFileIfExists(lesson.thumbnailPath);
    });

    module.deleteOne();
    await course.save();

    response.status(200).json({ message: "Module deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting module", error);
    response.status(500).json({ message: "Failed to delete module", error: error.message });
  }
};

export const ADD_LESSON: RequestHandler = (req, res) => {
  const request = req as MulterRequest;

  lessonUpload(request, res, async (err) => {
    const response = res;
    if (err instanceof multer.MulterError) {
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    }

    if (err) {
      response.status(400).json({ message: err.message });
      return;
    }

    try {
      const { courseId, moduleId } = request.params;
      const {
        title,
        description,
        videoType,
        youtubeUrl,
        duration,
        resources,
        position,
      } = request.body;

      if (!title || !videoType) {
        response.status(400).json({ message: "Lesson title and video type are required" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(moduleId)) {
        response.status(400).json({ message: "Invalid identifiers" });
        return;
      }

      const course = await Course.findById(courseId);
      if (!course) {
        response.status(404).json({ message: "Course not found" });
        return;
      }

      const module = course.modules.id(moduleId as any);
      if (!module) {
        response.status(404).json({ message: "Module not found" });
        return;
      }

      const videoFile = request.files?.["videoFile"]?.[0];
      const thumbnailFile = request.files?.["thumbnail"]?.[0];

      let finalVideoUrl: string | undefined;
      let youtubeNormalized: { watch: string; embed: string } | null = null;
      let localVideoPath: string | undefined;

      if (videoType === "upload") {
        if (!videoFile) {
          response.status(400).json({ message: "Video file is required for uploaded lessons" });
          return;
        }

        finalVideoUrl = buildPublicUrl(request, "course-videos", videoFile.filename);
        localVideoPath = videoFile.path;
      } else if (videoType === "youtube") {
        youtubeNormalized = normalizeYoutubeUrls(youtubeUrl || "");
        if (!youtubeNormalized) {
          response.status(400).json({ message: "Invalid YouTube URL" });
          return;
        }
        finalVideoUrl = youtubeNormalized.embed;
      } else {
        response.status(400).json({ message: "Unsupported video type" });
        return;
      }

      let thumbnailUrl: string | undefined;
      let thumbnailPath: string | undefined;

      if (thumbnailFile) {
        thumbnailUrl = buildPublicUrl(request, "course-thumbnails", thumbnailFile.filename);
        thumbnailPath = thumbnailFile.path;
      }

      const lessonPosition = position ? Number(position) : module.lessons.length + 1;

      const newLesson: Partial<ICourseLesson> = {
        title,
        description,
        videoType: videoType as ICourseLesson["videoType"],
        videoUrl: finalVideoUrl,
        youtubeUrl: youtubeNormalized?.watch,
        localVideoPath,
        duration: duration ? Number(duration) : undefined,
        thumbnailUrl,
        thumbnailPath,
        resources: parseResources(resources),
        position: lessonPosition,
      };

      module.lessons.push(newLesson as ICourseLesson);

      const insertedLesson = module.lessons[module.lessons.length - 1];
      const insertedLessonId = insertedLesson?._id;

      if (lessonPosition && lessonPosition <= module.lessons.length) {
        const currentIndex = module.lessons.length - 1;
        const targetIndex = Math.max(0, Math.min(lessonPosition - 1, module.lessons.length - 1));
        const [lessonDoc] = module.lessons.splice(currentIndex, 1) as unknown as ICourseLesson[];
        if (lessonDoc) {
          module.lessons.splice(targetIndex, 0, lessonDoc);
        }
      }

      recalculateLessonPositions(module);

      await course.save();

      const lessonDocuments = getLessonDocumentArray(module);
      const createdLesson = insertedLessonId
        ? lessonDocuments.id(insertedLessonId as any)
        : module.lessons[module.lessons.length - 1];

      response.status(201).json({ message: "Lesson added successfully", lesson: createdLesson });

      notifyCourseChange({
        course,
        action: "lesson-added",
        module,
        lesson: createdLesson || null,
        performedBy: request.body?.performedBy || course.createdByName,
      }).catch((error) => {
        console.error("Failed to trigger course lesson notification", error);
      });
    } catch (error: any) {
      console.error("Error adding lesson", error);
      response.status(500).json({ message: "Failed to add lesson", error: error.message });
    }
  });
};

export const UPDATE_LESSON: RequestHandler = (req, res) => {
  const request = req as MulterRequest;

  lessonUpload(request, res, async (err) => {
    const response = res;
    if (err instanceof multer.MulterError) {
      response.status(400).json({ message: `Upload error: ${err.message}` });
      return;
    }

    if (err) {
      response.status(400).json({ message: err.message });
      return;
    }

    try {
      const { courseId, moduleId, lessonId } = request.params;
      const {
        title,
        description,
        videoType,
        youtubeUrl,
        duration,
        resources,
        position,
        removeThumbnail,
      } = request.body;

      if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(moduleId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
        response.status(400).json({ message: "Invalid identifiers" });
        return;
      }

      const course = await Course.findById(courseId);
      if (!course) {
        response.status(404).json({ message: "Course not found" });
        return;
      }

      const module = course.modules.id(moduleId as any);
      if (!module) {
        response.status(404).json({ message: "Module not found" });
        return;
      }

      const lessonDocuments = getLessonDocumentArray(module);
      const lesson = lessonDocuments.id(lessonId as any);
      if (!lesson) {
        response.status(404).json({ message: "Lesson not found" });
        return;
      }

      const videoFile = request.files?.["videoFile"]?.[0];
      const thumbnailFile = request.files?.["thumbnail"]?.[0];

      if (title !== undefined) lesson.title = title;
      if (description !== undefined) lesson.description = description;
      if (duration !== undefined) {
        lesson.duration = duration ? Number(duration) : undefined;
      }
      if (resources !== undefined) lesson.resources = parseResources(resources);

      if (position) {
        const desiredPosition = Number(position);
        if (!Number.isNaN(desiredPosition) && desiredPosition > 0) {
          const currentIndex = module.lessons.findIndex(
            (item: ICourseLesson) => String(item._id) === String(lesson._id)
          );
          if (currentIndex !== -1) {
            const targetIndex = Math.min(desiredPosition - 1, module.lessons.length - 1);
            const [lessonDoc] = module.lessons.splice(currentIndex, 1);
            module.lessons.splice(targetIndex, 0, lessonDoc);
          }
        }
      }

      if (videoType) {
        if (videoType === "upload") {
          if (lesson.videoType === "youtube" && !videoFile) {
            response.status(400).json({ message: "Upload a video file when switching from YouTube to upload" });
            return;
          }

          if (videoFile) {
            if (lesson.videoType === "upload") {
              removeFileIfExists(lesson.localVideoPath);
            }
            lesson.videoUrl = buildPublicUrl(request, "course-videos", videoFile.filename);
            lesson.localVideoPath = videoFile.path;
          }

          lesson.videoType = "upload";
          lesson.youtubeUrl = undefined;
        } else if (videoType === "youtube") {
          const normalized = normalizeYoutubeUrls(youtubeUrl || "");
          if (!normalized) {
            response.status(400).json({ message: "Invalid YouTube URL" });
            return;
          }

          if (lesson.videoType === "upload") {
            removeFileIfExists(lesson.localVideoPath);
            lesson.localVideoPath = undefined;
          }

          lesson.videoType = "youtube";
          lesson.videoUrl = normalized.embed;
          lesson.youtubeUrl = normalized.watch;
        }
      } else if (videoFile && lesson.videoType === "upload") {
        removeFileIfExists(lesson.localVideoPath);
        lesson.videoUrl = buildPublicUrl(request, "course-videos", videoFile.filename);
        lesson.localVideoPath = videoFile.path;
      }

      if (thumbnailFile) {
        removeFileIfExists(lesson.thumbnailPath);
        lesson.thumbnailUrl = buildPublicUrl(request, "course-thumbnails", thumbnailFile.filename);
        lesson.thumbnailPath = thumbnailFile.path;
      } else if (removeThumbnail === "true") {
        removeFileIfExists(lesson.thumbnailPath);
        lesson.thumbnailUrl = undefined;
        lesson.thumbnailPath = undefined;
      }

      recalculateLessonPositions(module);

      await course.save();

      const updatedLesson = lessonDocuments.id(lessonId as any);

      response.status(200).json({ message: "Lesson updated successfully", lesson: updatedLesson });

      notifyCourseChange({
        course,
        action: "lesson-updated",
        module,
        lesson: updatedLesson || null,
        performedBy: request.body?.performedBy || course.createdByName,
      }).catch((error) => {
        console.error("Failed to trigger course lesson update notification", error);
      });
    } catch (error: any) {
      console.error("Error updating lesson", error);
      response.status(500).json({ message: "Failed to update lesson", error: error.message });
    }
  });
};

export const DELETE_LESSON = async (request: Request, response: Response) => {
  try {
    const { courseId, moduleId, lessonId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(moduleId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      response.status(400).json({ message: "Invalid identifiers" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    const module = course.modules.id(moduleId as any);
    if (!module) {
      response.status(404).json({ message: "Module not found" });
      return;
    }

    const lesson = getLessonDocumentArray(module).id(lessonId as any);
    if (!lesson) {
      response.status(404).json({ message: "Lesson not found" });
      return;
    }

    if (lesson.videoType === "upload") {
      removeFileIfExists(lesson.localVideoPath);
    }
    removeFileIfExists(lesson.thumbnailPath);

    lesson.deleteOne();

    recalculateLessonPositions(module);

    await course.save();

    response.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting lesson", error);
    response.status(500).json({ message: "Failed to delete lesson", error: error.message });
  }
};

export const CREATE_DISCUSSION = async (request: Request, response: Response) => {
  try {
    const { courseId, lessonId } = request.params;
    const { moduleId, question, studentClerkId, studentName, studentEmail } = request.body;

    if (!question || !studentClerkId) {
      response.status(400).json({ message: "Question and student information are required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      response.status(400).json({ message: "Invalid identifiers" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      response.status(404).json({ message: "Course not found" });
      return;
    }

    let moduleRef = moduleId ? course.modules.id(moduleId as any) : undefined;
    let lessonRef: ICourseLesson | undefined;

    if (moduleRef) {
      const lessonDocs = getLessonDocumentArray(moduleRef);
      lessonRef = lessonDocs.id(lessonId as any) as unknown as ICourseLesson | undefined;
    } else {
      course.modules.forEach((module: ICourseModule) => {
        const lessonDocs = getLessonDocumentArray(module);
        const match = lessonDocs.id(lessonId as any) as unknown as ICourseLesson | undefined;
        if (match) {
          moduleRef = module;
          lessonRef = match;
        }
      });
    }

    if (!lessonRef) {
      response.status(404).json({ message: "Lesson not found" });
      return;
    }

    const discussion = await CourseDiscussion.create({
      course: course._id,
      moduleId: moduleRef?._id,
      lessonId: lessonRef._id,
      question,
      askedByClerkId: studentClerkId,
      askedByName: studentName,
      askedByEmail: studentEmail,
      messages: [
        {
          senderClerkId: studentClerkId,
          senderRole: "student",
          senderName: studentName,
          senderEmail: studentEmail,
          message: question,
        },
      ],
    });

    response.status(201).json({ message: "Discussion created successfully", discussion });
  } catch (error: any) {
    console.error("Error creating discussion", error);
    response.status(500).json({ message: "Failed to create discussion", error: error.message });
  }
};

export const LIST_LESSON_DISCUSSIONS = async (request: Request, response: Response) => {
  try {
    const { courseId, lessonId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lessonId)) {
      response.status(400).json({ message: "Invalid identifiers" });
      return;
    }

    const discussions = await CourseDiscussion.find({
      course: courseId,
      lessonId,
    }).sort({ createdAt: -1 });

    response.status(200).json({ discussions });
  } catch (error: any) {
    console.error("Error fetching discussions", error);
    response.status(500).json({ message: "Failed to fetch discussions", error: error.message });
  }
};

export const LIST_COURSE_DISCUSSIONS = async (request: Request, response: Response) => {
  try {
    const { courseId } = request.params;
    const { status } = request.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      response.status(400).json({ message: "Invalid course id" });
      return;
    }

    const filter: any = { course: courseId };
    if (status && ["open", "answered", "closed"].includes(status as string)) {
      filter.status = status;
    }

    const discussions = await CourseDiscussion.find(filter).sort({ createdAt: -1 });

    response.status(200).json({ discussions });
  } catch (error: any) {
    console.error("Error fetching course discussions", error);
    response.status(500).json({ message: "Failed to fetch course discussions", error: error.message });
  }
};

export const REPLY_TO_DISCUSSION = async (request: Request, response: Response) => {
  try {
    const { discussionId } = request.params;
    const { message, responderClerkId, responderRole, responderName, responderEmail, status } = request.body;

    if (!message || !responderClerkId || !responderRole) {
      response.status(400).json({ message: "Missing required reply fields" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      response.status(400).json({ message: "Invalid discussion id" });
      return;
    }

    const discussion = await CourseDiscussion.findById(discussionId);

    if (!discussion) {
      response.status(404).json({ message: "Discussion not found" });
      return;
    }

    discussion.messages.push({
      senderClerkId: responderClerkId,
      senderRole: responderRole,
      senderName: responderName,
      senderEmail: responderEmail,
      message,
      createdAt: new Date(),
    } as any);

    if (responderRole === "teacher") {
      discussion.status = "answered";
    } else {
      discussion.status = "open";
    }

    if (status && ["open", "answered", "closed"].includes(status)) {
      discussion.status = status as any;
    }

    await discussion.save();

    response.status(201).json({ message: "Reply added successfully", discussion });
  } catch (error: any) {
    console.error("Error replying to discussion", error);
    response.status(500).json({ message: "Failed to add reply", error: error.message });
  }
};
