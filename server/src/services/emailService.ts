import StudentSchema from "../models/StudentSchema";
import {
  buildAnnouncementEmail,
  buildCourseEmail,
  buildTaskEmail,
} from "./emailTemplates";
import { ICourse, ICourseLesson, ICourseModule } from "../models/CourseSchema";
import mongoose from "mongoose";

let nodemailer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nodemailer = require("nodemailer");
} catch (error) {
  console.warn("nodemailer package not installed. Email notifications are disabled until dependencies are installed.");
}

type Recipient = { email: string; name?: string };

let transporterCache: any | null | undefined;
let transporterWarningLogged = false;

const resolveAppBaseUrl = () => process.env.APP_BASE_URL || "http://localhost:5173";

const buildTransporter = () => {
  if (!nodemailer) {
    return null;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || "no-reply@connectx";

  const isConfigured = Boolean(host && port && from);

  if (!isConfigured) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

const ensureTransporter = () => {
  if (transporterCache === undefined) {
    transporterCache = buildTransporter();
    if (!transporterCache && !transporterWarningLogged) {
      transporterWarningLogged = true;
      console.warn("Email notifications are disabled. Provide SMTP credentials to enable them.");
    }
  }

  return transporterCache;
};

const normalizeAudienceValue = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const lowered = trimmed.toLowerCase();
  const neutralTokens = new Set([
    "all",
    "all years",
    "all year",
    "all divisions",
    "all division",
    "any",
    "none",
    "n/a"
  ]);

  if (neutralTokens.has(lowered)) {
    return undefined;
  }

  return lowered;
};

const getStudentRecipients = async (audience?: { year?: string | null; division?: string | null }) => {
  const filter: Record<string, unknown> = {};

  const normalizedYear = normalizeAudienceValue(audience?.year);
  const normalizedDivision = normalizeAudienceValue(audience?.division);

  if (normalizedYear) {
    filter.year = normalizedYear;
  }

  if (normalizedDivision) {
    filter.division = normalizedDivision;
  }

  const students = await StudentSchema.find(filter, { email: 1, name: 1 }).lean();

  const unique = new Map<string, Recipient>();

  students.forEach((student) => {
    if (!student.email) {
      return;
    }
    const normalizedEmail = student.email.trim().toLowerCase();
    if (!unique.has(normalizedEmail)) {
      unique.set(normalizedEmail, { email: student.email, name: student.name });
    }
  });

  return Array.from(unique.values());
};

const sendEmail = async (options: { subject: string; html: string; recipients: Recipient[] }) => {
  const { subject, html, recipients } = options;

  const transporter = ensureTransporter();

  if (!transporter) {
    console.warn(`Skipped email delivery for subject "${subject}" because SMTP is not configured.`);
    return;
  }

  if (!recipients.length) {
    console.warn(`Skipped email delivery for subject "${subject}" because no recipients were resolved.`);
    return;
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@connectx";

  await transporter.sendMail({
    from: fromAddress,
    to: fromAddress,
    bcc: recipients.map((recipient) => recipient.email),
    subject,
    html,
  });
};

export const notifyAnnouncementCreated = async (announcement: {
  title: string;
  content: string;
  category: string;
  priority?: string;
  author?: string;
  date?: string;
}) => {
  try {
    const recipients = await getStudentRecipients();
    const html = buildAnnouncementEmail({
      announcement,
      ctaUrl: `${resolveAppBaseUrl()}/announcements`,
    });

    await sendEmail({
      subject: `[ConnectX] New Announcement: ${announcement.title}`,
      html,
      recipients,
    });
  } catch (error) {
    console.error("Failed to dispatch announcement notification", error);
  }
};

export const notifyTaskCreated = async (task: {
  title: string;
  description: string;
  subject: string;
  dueDate?: string;
  points?: string;
  priority?: string;
  assignedYear?: string;
  assignedDivision?: string;
}) => {
  try {
    const recipients = await getStudentRecipients({
      year: task.assignedYear,
      division: task.assignedDivision,
    });

    const html = buildTaskEmail({
      task,
      ctaUrl: `${resolveAppBaseUrl()}/tasks`,
    });

    await sendEmail({
      subject: `[ConnectX] New Task: ${task.title}`,
      html,
      recipients,
    });
  } catch (error) {
    console.error("Failed to dispatch task notification", error);
  }
};

interface CourseNotificationMeta {
  course: ICourse | (ICourse & mongoose.Document);
  action: "course-created" | "course-updated" | "module-added" | "lesson-added" | "lesson-updated";
  module?: ICourseModule | null;
  lesson?: ICourseLesson | null;
  performedBy?: string;
}

const getCourseRecipients = async (course: ICourse | (ICourse & mongoose.Document)) =>
  getStudentRecipients({
    year: course.targetYear,
    division: course.targetDivision,
  });

export const notifyCourseChange = async ({ course, action, module, lesson, performedBy }: CourseNotificationMeta) => {
  try {
    const recipients = await getCourseRecipients(course);
    if (!recipients.length) {
      console.warn(`Skipped course notification for ${course.title} – no recipients matched audience.`);
      return;
    }

    const html = buildCourseEmail({
      course,
      action,
      module: module || undefined,
      lesson: lesson || undefined,
      performedBy,
      ctaUrl: `${resolveAppBaseUrl()}/courses/${course._id}`,
    });

    const subjectMap: Record<CourseNotificationMeta["action"], string> = {
      "course-created": `[ConnectX] New Course: ${course.title}`,
      "course-updated": `[ConnectX] Course Updated: ${course.title}`,
      "module-added": `[ConnectX] New Module in ${course.title}`,
      "lesson-added": `[ConnectX] New Lesson in ${course.title}`,
      "lesson-updated": `[ConnectX] Lesson Updated in ${course.title}`,
    };

    await sendEmail({
      subject: subjectMap[action],
      html,
      recipients,
    });
  } catch (error) {
    console.error("Failed to dispatch course notification", error);
  }
};
