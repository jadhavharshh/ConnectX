"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyCourseChange = exports.notifyTaskCreated = exports.notifyAnnouncementCreated = void 0;
const StudentSchema_1 = __importDefault(require("../models/StudentSchema"));
const emailTemplates_1 = require("./emailTemplates");
let nodemailer = null;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    nodemailer = require("nodemailer");
}
catch (error) {
    console.warn("nodemailer package not installed. Email notifications are disabled until dependencies are installed.");
}
let transporterCache;
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
const normalizeAudienceValue = (value) => {
    if (!value)
        return undefined;
    const trimmed = value.trim();
    if (!trimmed)
        return undefined;
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
const getStudentRecipients = (audience) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
    const normalizedYear = normalizeAudienceValue(audience === null || audience === void 0 ? void 0 : audience.year);
    const normalizedDivision = normalizeAudienceValue(audience === null || audience === void 0 ? void 0 : audience.division);
    if (normalizedYear) {
        filter.year = normalizedYear;
    }
    if (normalizedDivision) {
        filter.division = normalizedDivision;
    }
    const students = yield StudentSchema_1.default.find(filter, { email: 1, name: 1 }).lean();
    const unique = new Map();
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
});
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield transporter.sendMail({
        from: fromAddress,
        to: fromAddress,
        bcc: recipients.map((recipient) => recipient.email),
        subject,
        html,
    });
});
const notifyAnnouncementCreated = (announcement) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipients = yield getStudentRecipients();
        const html = (0, emailTemplates_1.buildAnnouncementEmail)({
            announcement,
            ctaUrl: `${resolveAppBaseUrl()}/announcements`,
        });
        yield sendEmail({
            subject: `[ConnectX] New Announcement: ${announcement.title}`,
            html,
            recipients,
        });
    }
    catch (error) {
        console.error("Failed to dispatch announcement notification", error);
    }
});
exports.notifyAnnouncementCreated = notifyAnnouncementCreated;
const notifyTaskCreated = (task) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recipients = yield getStudentRecipients({
            year: task.assignedYear,
            division: task.assignedDivision,
        });
        const html = (0, emailTemplates_1.buildTaskEmail)({
            task,
            ctaUrl: `${resolveAppBaseUrl()}/tasks`,
        });
        yield sendEmail({
            subject: `[ConnectX] New Task: ${task.title}`,
            html,
            recipients,
        });
    }
    catch (error) {
        console.error("Failed to dispatch task notification", error);
    }
});
exports.notifyTaskCreated = notifyTaskCreated;
const getCourseRecipients = (course) => __awaiter(void 0, void 0, void 0, function* () {
    return getStudentRecipients({
        year: course.targetYear,
        division: course.targetDivision,
    });
});
const notifyCourseChange = (_a) => __awaiter(void 0, [_a], void 0, function* ({ course, action, module, lesson, performedBy }) {
    try {
        const recipients = yield getCourseRecipients(course);
        if (!recipients.length) {
            console.warn(`Skipped course notification for ${course.title} – no recipients matched audience.`);
            return;
        }
        const html = (0, emailTemplates_1.buildCourseEmail)({
            course,
            action,
            module: module || undefined,
            lesson: lesson || undefined,
            performedBy,
            ctaUrl: `${resolveAppBaseUrl()}/courses/${course._id}`,
        });
        const subjectMap = {
            "course-created": `[ConnectX] New Course: ${course.title}`,
            "course-updated": `[ConnectX] Course Updated: ${course.title}`,
            "module-added": `[ConnectX] New Module in ${course.title}`,
            "lesson-added": `[ConnectX] New Lesson in ${course.title}`,
            "lesson-updated": `[ConnectX] Lesson Updated in ${course.title}`,
        };
        yield sendEmail({
            subject: subjectMap[action],
            html,
            recipients,
        });
    }
    catch (error) {
        console.error("Failed to dispatch course notification", error);
    }
});
exports.notifyCourseChange = notifyCourseChange;
