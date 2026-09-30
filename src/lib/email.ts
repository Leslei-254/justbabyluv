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

export async function sendEmail({ to, subject, text, html }: SendEmailInput) {
  if (!resendClient) {
    logServerEvent({
      severity: "warn",
      event: "email.provider_unconfigured",
      metadata: { mode: "dev-fallback" },
    });
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
      logServerError({
        event: "email.send_failed",
        metadata: { provider: "resend" },
        error: result.error,
      });
      return { ok: false, mode: "resend" as const, error: safeErrorMessage(result.error) };
    }
    return { ok: true, mode: "resend" as const };
  } catch (error) {
    logServerError({
      event: "email.send_exception",
      metadata: { provider: "resend" },
      error,
    });
    return { ok: false, mode: "resend" as const, error: safeErrorMessage(error) };
  }
}
