import { ICourse, ICourseLesson, ICourseModule } from "../models/CourseSchema";
import { Document } from "mongoose";

interface BaseTemplateOptions {
  headline: string;
  title: string;
  introLines: string[];
  highlightLabel?: string;
  highlightValue?: string;
  details?: Array<{ label: string; value?: string } | null>;
  cta?: { text: string; url: string };
  footerNote?: string;
  preheader?: string;
}

const htmlEscape = (value?: string | null) => {
  if (!value) return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderParagraphs = (lines: string[]) =>
  lines
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin: 0 0 14px 0; color: #0f172a; font-size: 16px; line-height: 1.7;">${line}</p>`
    )
    .join("");

const renderDetails = (details?: Array<{ label: string; value?: string } | null>) => {
  if (!details?.length) return "";
  const rows = details
    .filter(Boolean)
    .map((detail) => {
      if (!detail) return "";
      return `
        <tr>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a; font-size: 13px; letter-spacing: 0.4px;">${htmlEscape(
            detail.label
          )}</td>
          <td style="padding: 8px 0; font-size: 13px; color: #475569;">${htmlEscape(
            detail.value || "-"
          )}</td>
        </tr>`;
    })
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      ${rows}
    </table>
  `;
};

const renderCTA = (cta?: { text: string; url: string }) => {
  if (!cta) return "";
  return `
    <div style="margin-top: 28px;">
      <a href="${cta.url}"
         style="display: inline-block; padding: 14px 28px; border-radius: 999px; background: linear-gradient(135deg, #4338ca, #1d4ed8); color: #ffffff; font-size: 15px; font-weight: 600; letter-spacing: 0.4px; text-decoration: none; box-shadow: 0 15px 30px rgba(29, 78, 216, 0.25);">
        ${htmlEscape(cta.text)}
      </a>
    </div>
  `;
};

const renderBaseTemplate = ({
  headline,
  title,
  introLines,
  highlightLabel,
  highlightValue,
  details,
  cta,
  footerNote,
  preheader,
}: BaseTemplateOptions) => {
  const preheaderText = preheader ? preheader : title;

  return `<!doctype html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${htmlEscape(title)}</title>
    </head>
    <body style="margin: 0; background-color: #0f172a; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a;">
      <span style="display:none; color:#0f172a;">${htmlEscape(preheaderText)}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; padding: 40px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 640px; background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 28px; overflow: hidden; border: 1px solid rgba(148, 163, 184, 0.25); box-shadow: 0 40px 80px rgba(15, 23, 42, 0.20);">
              <tr>
                <td style="padding: 40px 42px 30px 42px; background: radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.18), transparent 55%), radial-gradient(circle at 100% 0%, rgba(14, 165, 233, 0.22), transparent 62%);">
                  <p style="margin: 0; letter-spacing: 4px; font-size: 12px; text-transform: uppercase; color: rgba(15, 23, 42, 0.55); font-weight: 600;">${htmlEscape(
                    headline
                  )}</p>
                  <h1 style="margin: 16px 0 0 0; font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: -0.6px;">${htmlEscape(
                    title
                  )}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 42px 42px 42px; background: #ffffff;">
                  ${highlightLabel && highlightValue
                    ? `<div style="display: inline-flex; align-items: center; padding: 12px 18px; margin-top: -26px; border-radius: 999px; background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.12)); border: 1px solid rgba(59, 130, 246, 0.20); box-shadow: 0 15px 30px rgba(37, 99, 235, 0.10);">
                        <span style="font-size: 13px; text-transform: uppercase; color: rgba(15, 23, 42, 0.55); letter-spacing: 2px; font-weight: 600; margin-right: 14px;">${htmlEscape(
                          highlightLabel
                        )}</span>
                        <span style="font-size: 15px; font-weight: 600; color: #0f172a;">${htmlEscape(
                          highlightValue
                        )}</span>
                      </div>`
                    : ""}

                  <div style="margin-top: 32px; color: #0f172a;">
                    ${renderParagraphs(introLines)}
                  </div>
                  ${renderDetails(details)}
                  ${renderCTA(cta)}
                  <p style="margin-top: 32px; font-size: 13px; color: rgba(15, 23, 42, 0.55); line-height: 1.6;">
                    ${
                      footerNote || "You are receiving this update because you are part of the ConnectX learning community."
                    }
                  </p>
                </td>
              </tr>
            </table>
            <p style="margin-top: 24px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(226, 232, 240, 0.85); font-weight: 500;">ConnectX • Crafted for modern learning</p>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

export const buildAnnouncementEmail = (options: {
  announcement: { title: string; content: string; category: string; priority?: string; author?: string; date?: string };
  ctaUrl: string;
}) => {
  const { announcement, ctaUrl } = options;
  const escapedAuthor = htmlEscape(announcement.author) || "your faculty";
  const sanitizedContent = htmlEscape(announcement.content || "").replace(/\n/g, "<br/>");
  const introLines = [
    `A new announcement has been posted by ${escapedAuthor}.`,
    sanitizedContent,
  ];

  const details = [
    { label: "Category", value: announcement.category },
    announcement.priority ? { label: "Priority", value: announcement.priority } : null,
    announcement.date ? { label: "Date", value: announcement.date } : null,
  ];

  return renderBaseTemplate({
    headline: "ConnectX Announcement",
    title: announcement.title,
    introLines,
    highlightLabel: "Announced By",
    highlightValue: announcement.author || "ConnectX Team",
    details,
    cta: { text: "View Announcement", url: ctaUrl },
    preheader: announcement.content.slice(0, 120),
  });
};

export const buildTaskEmail = (options: {
  task: {
    title: string;
    description: string;
    subject: string;
    dueDate?: string;
    points?: string;
    priority?: string;
    assignedYear?: string;
    assignedDivision?: string;
  };
  ctaUrl: string;
}) => {
  const { task, ctaUrl } = options;
  const sanitizedDescription = htmlEscape(task.description || "").replace(/\n/g, "<br/>");
  const introLines = [
    `A new task has been published for ${htmlEscape(task.subject)}.`,
    sanitizedDescription,
  ];

  const details = [
    task.dueDate ? { label: "Due Date", value: task.dueDate } : null,
    task.points ? { label: "Points", value: task.points } : null,
    task.priority ? { label: "Priority", value: task.priority } : null,
    task.assignedYear ? { label: "Target Year", value: task.assignedYear } : null,
    task.assignedDivision ? { label: "Division", value: task.assignedDivision } : null,
  ];

  return renderBaseTemplate({
    headline: "ConnectX Task Update",
    title: task.title,
    introLines,
    highlightLabel: "Subject",
    highlightValue: task.subject,
    details,
    cta: { text: "Open Task", url: ctaUrl },
    preheader: task.description.slice(0, 120),
  });
};

export const buildCourseEmail = (options: {
  course: ICourse | (ICourse & Document);
  action: "course-created" | "course-updated" | "module-added" | "lesson-added" | "lesson-updated";
  module?: ICourseModule;
  lesson?: ICourseLesson;
  performedBy?: string;
  ctaUrl: string;
}) => {
  const { course, action, module, lesson, performedBy, ctaUrl } = options;

  const actor = performedBy || course.createdByName || "Your instructor";
  const escapedActor = htmlEscape(actor);

  const introLines: string[] = [];

  if (action === "course-created") {
    introLines.push(`${escapedActor} launched a new course: <strong>${htmlEscape(course.title)}</strong>.`);
    introLines.push(htmlEscape(course.description || ""));
  } else if (action === "course-updated") {
    introLines.push(`${escapedActor} refreshed the course details for <strong>${htmlEscape(course.title)}</strong>.`);
    introLines.push("Log in to review the latest overview and materials.");
  } else if (action === "module-added" && module) {
    introLines.push(`${escapedActor} added a new module to ${htmlEscape(course.title)}.`);
    introLines.push(`<strong>${htmlEscape(module.title)}</strong> – ${htmlEscape(module.summary || "")}`);
  } else if (action === "lesson-added" && module && lesson) {
    introLines.push(`${escapedActor} published a new lesson in ${htmlEscape(module.title)}.`);
    introLines.push(`<strong>${htmlEscape(lesson.title)}</strong> is now ready to watch.`);
  } else if (action === "lesson-updated" && module && lesson) {
    introLines.push(`${escapedActor} refreshed lesson content in ${htmlEscape(module.title)}.`);
    introLines.push(`<strong>${htmlEscape(lesson.title)}</strong> has updated material waiting for you.`);
  }

  const details = [
    { label: "Course", value: course.title },
    { label: "Category", value: course.category },
    { label: "Level", value: course.level },
    { label: "Target Year", value: course.targetYear },
    { label: "Target Division", value: course.targetDivision },
  ];

  const highlightMap: Record<typeof options.action, { label: string; value: string }> = {
    "course-created": {
      label: "New Course",
      value: course.title,
    },
    "course-updated": {
      label: "Updated",
      value: new Date(course.updatedAt).toLocaleString(),
    },
    "module-added": {
      label: "Module Added",
      value: module?.title || "New Module",
    },
    "lesson-added": {
      label: "Lesson Added",
      value: lesson?.title || "New Lesson",
    },
    "lesson-updated": {
      label: "Lesson Updated",
      value: lesson?.title || "Lesson",
    },
  };

  return renderBaseTemplate({
    headline: "ConnectX Course Update",
    title: course.title,
    introLines,
    highlightLabel: highlightMap[action].label,
    highlightValue: highlightMap[action].value,
    details,
    cta: { text: "Open Course", url: ctaUrl },
    preheader: `${course.title} has new updates waiting for you.`,
  });
};
