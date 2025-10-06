# Email Notification Setup Guide

This guide walks you through configuring and validating the new ConnectX notification pipeline that emails students when teachers post announcements, publish tasks, or update course content.

---

## 1. Overview

ConnectX now emits notifications for four teacher-driven events:

1. **Announcements** – every new announcement dispatches an email to all students.
2. **Tasks** – new tasks email only the targeted year/division (if provided).
3. **Course lifecycle** – creating or updating a course alerts enrolled audiences.
4. **Course content** – adding or updating modules/lessons notifies the relevant cohort.

Emails are delivered through Gmail SMTP using the official app-password workflow and rendered with a polished, responsive HTML template.

---

## 2. Prerequisites

1. **Google Workspace / Gmail account** with 2-step verification enabled.
2. **App password** generated for “Mail” ➜ “Other (Custom name)” (already issued as `eeua lovw hmkb vnbs`).
3. **Node dependencies** installed inside the server project:
   ```bash
   cd server
   npm install
   npm install nodemailer @types/nodemailer
   ```

> ℹ️ The code gracefully skips delivery if SMTP credentials are absent, but the steps below ensure real emails are sent.

---

## 3. Environment Variables

Update or confirm `server/.env` contains the following keys:

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=harshjadhavconnect@gmail.com
SMTP_PASS=eeua lovw hmkb vnbs
SMTP_FROM=harshjadhavconnect@gmail.com
APP_BASE_URL=http://localhost:5173
```

### Notes
- `SMTP_HOST` / `SMTP_PORT` target Gmail’s secure SMTP endpoint.
- `SMTP_FROM` can stay equal to `SMTP_USER`; it’s the visible “From” address.
- `APP_BASE_URL` points email CTAs back to the Vite frontend. Change this when deploying.

After editing the file, restart the Node server so the new variables load.

---

## 4. How Delivery Works

1. **Audience Resolution** – the backend queries `StudentSchema` by `year` and `division` (if provided). Emails are deduplicated by address.
2. **Template Rendering** – the service builds a tailored HTML email (announcement, task, or course update) with consistent styling.
3. **SMTP Dispatch** – emails send via Nodemailer using Gmail SMTP. All recipients are placed in BCC to protect privacy; the `SMTP_FROM` address is the primary “To”.
4. **Logging** – failures print to the server console but do not crash API handlers.

Key implementation files:
- `server/src/services/emailService.ts`
- `server/src/services/emailTemplates.ts`
- `server/src/controllers/DataController.ts`
- `server/src/controllers/CourseController.ts`

---

## 5. Verifying the Flow (Local)

Follow this checklist to confirm everything functions end-to-end:

1. **Prepare test data**
   - Ensure you have at least one student record in MongoDB with a valid Gmail address and (optionally) matching `year`/`division` for targeted tasks or courses.

2. **Run the backend**
   ```bash
   cd server
   npm run dev
   ```

3. **Trigger each event from the UI** (sign in as a teacher)
   1. Create an announcement ➜ email should reach all student recipients.
   2. Create a task ➜ email should reach the selected year/division only.
   3. Create a new course ➜ email to the course’s target audience.
   4. Add a module ➜ email to the same audience.
   5. Add or update a lesson ➜ email again (shows updated material).

4. **Check the Gmail inbox**
   - Emails should appear within seconds. Because Gmail may cluster similar emails, look under “Updates” or “Promotions” if not in the primary tab.

5. **Inspect server logs**
   - Success is silent unless you log manually. Failures print descriptive errors (authentication, missing recipients, etc.).

---

## 6. Troubleshooting

| Symptom | Likely Cause | Fix |
| --- | --- | --- |
| `nodemailer package not installed` warning | Skipped the dependency install | Run `npm install nodemailer @types/nodemailer` inside `server/` |
| `SMTP credentials missing` warning | Env vars not set or server not restarted | Double-check `server/.env`; restart the server |
| Authentication error | App password incorrect or 2FA disabled | Regenerate the Gmail app password and update `.env` |
| Emails delayed or spammed | Gmail is throttling or marking as promotional | Encourage recipients to mark “Not spam”; consider domain reputation in production |
| No recipients found | Student records don’t match the targeted audience | Verify `year` and `division` values in MongoDB |

---

## 7. Production Checklist

1. Switch `APP_BASE_URL` to your deployed frontend URL.
2. Use a dedicated notification account (e.g., `no-reply@yourdomain.com`).
3. Consider moving SMTP credentials into a secret manager instead of plain `.env`.
4. Monitor bounce/complaint rates if you scale beyond a few hundred recipients.

---

You’re all set! With SMTP configured and templates in place, every announcement, task, and course change now lands directly in student inboxes.
