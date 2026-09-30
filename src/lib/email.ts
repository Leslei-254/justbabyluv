import { Resend } from "resend";
import { logServerEvent, logServerError } from "@/lib/logger";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const resendApiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM || "JustBaby Luv <reminders@justbabyluv.com>";
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

function safeErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 200) : "Email delivery failed";
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

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  if (!resendClient) {
    logServerEvent({
      severity: "warn",
      event: "email.provider_unconfigured",
      metadata: { mode: "dev-fallback" },
    });
    return { ok: true, mode: "dev-fallback" as const, providerMessageId: null };
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
      logServerError({
        event: "email.send_failed",
        metadata: { provider: "resend" },
        error: result.error,
      });
      return { ok: false, mode: "resend" as const, error: safeErrorMessage(result.error) };
    }
    return { ok: true, mode: "resend" as const, providerMessageId: result.data?.id ?? null };
  } catch (error) {
    logServerError({
      event: "email.send_exception",
      metadata: { provider: "resend" },
      error,
    });
    return { ok: false, mode: "resend" as const, error: safeErrorMessage(error) };
  }
}
