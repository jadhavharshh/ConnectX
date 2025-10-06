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
        `<p style="margin: 0 0 12px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">${line}</p>`
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
          <td style="padding: 6px 0; font-weight: 600; color: #111827; font-size: 13px;">${htmlEscape(
            detail.label
          )}</td>
          <td style="padding: 6px 0; font-size: 13px; color: #374151;">${htmlEscape(
            detail.value || "-"
          )}</td>
        </tr>`;
    })
    .join("");

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; margin-top: 16px;">
      ${rows}
    </table>
  `;
};

const renderCTA = (cta?: { text: string; url: string }) => {
  if (!cta) return "";
  return `
    <div style="margin-top: 24px;">
      <a href="${cta.url}"
         style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none;">
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
    <body style="margin: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827;">
      <span style="display:none; color:#f3f4f6;">${htmlEscape(preheaderText)}</span>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f3f4f6; padding: 32px 0;">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 16px 40px rgba(79, 70, 229, 0.15);">
              <tr>
                <td style="padding: 32px; background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: #ffffff;">
                  <p style="margin: 0; letter-spacing: 1.5px; font-size: 12px; text-transform: uppercase; opacity: 0.8;">${htmlEscape(
                    headline
                  )}</p>
                  <h1 style="margin: 12px 0 0 0; font-size: 24px; font-weight: 700;">${htmlEscape(
                    title
                  )}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px;">
                  ${highlightLabel && highlightValue
                    ? `<div style="border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px 20px; background-color: #f9fafb; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6366f1; letter-spacing: 1px;">${htmlEscape(
                          highlightLabel
                        )}</p>
                        <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; color: #1f2937;">${htmlEscape(
                          highlightValue
                        )}</p>
                      </div>`
                    : ""}
                  ${renderParagraphs(introLines)}
                  ${renderDetails(details)}
                  ${renderCTA(cta)}
                  <p style="margin-top: 32px; font-size: 12px; color: #9ca3af;">${
                    footerNote || "You're receiving this update because you're part of the ConnectX learning community."
                  }</p>
                </td>
              </tr>
            </table>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">ConnectX • Empowering collaborative learning</p>
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
