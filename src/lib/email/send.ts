import { Resend } from "resend";
import { render } from "@react-email/components";
import WeeklyEmail, { type WeeklyEmailProps } from "@/emails/WeeklyEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Mathieu de Karma <hello@hellokarma.fr>";

export async function sendWeeklyEmail(
  to: string,
  props: WeeklyEmailProps
): Promise<{ id: string }> {
  const html = await render(WeeklyEmail(props));
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Tes 3 idées pour ${props.partnerFirstName} cette semaine`,
    html,
  });
  if (error || !data) throw new Error(error?.message ?? "Resend returned no data");
  return { id: data.id };
}

export async function sendReminderEmail(
  to: string,
  memberFirstName: string,
  partnerFirstName: string
): Promise<{ id: string }> {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#f5f0e8;font-family:Georgia,serif;padding:40px 24px;max-width:560px;margin:0 auto;">
  <p style="color:#c9a84c;font-size:13px;letter-spacing:.3em;text-transform:uppercase;">KARMA</p>
  <p style="font-size:16px;line-height:1.7;">Salut ${memberFirstName},</p>
  <p style="font-size:16px;line-height:1.7;">
    Tu n'as pas encore fait une idée pour ${partnerFirstName} cette semaine. Ça prend 5 minutes. Reprends le mail de lundi.
  </p>
  <p style="font-size:13px;color:#888880;margin-top:32px;">Mathieu · choisi avec Caroline</p>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${partnerFirstName} attend encore...`,
    html,
  });
  if (error || !data) throw new Error(error?.message ?? "Resend returned no data");
  return { id: data.id };
}
