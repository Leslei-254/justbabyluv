import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "JustBaby Luv <reminders@justbabyluv.com>";

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Reusable email service.
 *
 * If RESEND_API_KEY is not configured, this safely falls back to logging
 * the email to the console instead of throwing — so the app keeps working
 * in local development without any provider set up.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  if (!resendClient) {
    console.log(
      `[email:dev-fallback] No RESEND_API_KEY set. Would send email:\n` +
        `  To: ${to}\n  Subject: ${subject}\n  Body:\n${text}\n`
    );
    return { ok: true, mode: "dev-fallback" as const };
  }

  try {
    const result = await resendClient.emails.send({
      from,
      to,
      subject,
      text,
      html: html ?? `<p>${text.replace(/\n/g, "<br/>")}</p>`,
    });
    if (result.error) {
      console.error("[email:resend] Failed to send:", result.error);
      return { ok: false, mode: "resend" as const, error: result.error.message };
    }
    return { ok: true, mode: "resend" as const };
  } catch (err) {
    console.error("[email:resend] Unexpected error:", err);
    return { ok: false, mode: "resend" as const, error: String(err) };
  }
}

export function buildReminderEmail(params: {
  babyName: string;
  title: string;
  when: Date;
}) {
  const { babyName, title, when } = params;
  const time = when.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return {
    subject: `JustBaby Luv reminder: ${title}`,
    text: `Hi,\nThis is your reminder for ${babyName}:\n${title} at ${time}.\n\nOpen Baby Care to mark it complete.`,
  };
}
