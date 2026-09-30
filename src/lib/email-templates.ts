const appUrl = process.env.APP_URL || "http://localhost:3000";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function buildWelcomeEmail(name: string) {
  const safeName = escapeHtml(name.trim());
  const firstName = safeName.split(/\s+/)[0] || "there";
  const textName = name.trim().split(/\s+/)[0] || "there";
  const subject = "Welcome to JustBaby Luv";

  const text = `Hi ${textName},

Welcome to JustBaby Luv.

JustBaby Luv gives you one calm place to keep track of the everyday moments that matter — feeds, diapers, sleep, pumping, medication reminders, milestones, and more.

You can get started here:
${appUrl}/onboarding

Your account is protected by the email and password you used to sign up. Please keep your password private and use the account settings to manage your preferences.

This is a transactional account email, not a marketing message. You are receiving it because you created a JustBaby Luv account.

JustBaby Luv
Keep track of the little things that matter.
`;

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#fbf6f2;color:#332b29;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #eadfda;border-radius:20px;padding:32px;">
        <div style="text-align:center;">
          <img src="${appUrl}/brand/mark.svg" width="56" height="56" alt="JustBaby Luv" style="display:block;margin:0 auto 18px;border-radius:16px;" />
          <h1 style="margin:0;font-size:28px;line-height:1.2;color:#332b29;">Welcome, ${firstName}.</h1>
        </div>

        <p style="font-size:16px;line-height:1.7;margin:28px 0 0;">
          We’re glad you’re here. JustBaby Luv gives you one calm place to keep track of the everyday moments that matter.
        </p>

        <p style="font-size:16px;line-height:1.7;margin:16px 0 0;">
          Track feeds, diapers, sleep, pumping, medication reminders, milestones, and more — all in one place.
        </p>

        <div style="text-align:center;margin:28px 0;">
          <a href="${appUrl}/onboarding" style="display:inline-block;background:#c85b70;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 24px;border-radius:12px;">
            Open JustBaby Luv
          </a>
        </div>

        <div style="border-top:1px solid #eadfda;margin-top:28px;padding-top:20px;">
          <p style="font-size:13px;line-height:1.6;color:#756966;margin:0;">
            Keep your password private and use your account settings to manage your preferences. This is a transactional account email sent because you created a JustBaby Luv account, not a marketing message.
          </p>
        </div>
      </div>

      <p style="font-size:12px;line-height:1.6;color:#8b7f7a;text-align:center;margin:18px 8px 0;">
        JustBaby Luv · Keep track of the little things that matter.<br />
        You can manage your account and communication preferences from the app.
      </p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
