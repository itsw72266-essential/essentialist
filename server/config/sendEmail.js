import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API ?? "";
const DEFAULT_FROM =
  process.env.RESEND_SENDER ?? "Essentialist Makeup Store <onboarding@resend.dev>";

if (!RESEND_API_KEY) {
  console.warn("Provide RESEND_API in the .env file to enable Resend emails.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const sendEmail = async ({
  sendTo,
  subject,
  html,
  text,
  from = DEFAULT_FROM,
  replyTo,
}) => {
  if (!resend) {
    return { success: false, error: new Error("Resend not configured") };
  }

  const recipients = Array.isArray(sendTo)
    ? sendTo.filter(Boolean)
    : [sendTo].filter(Boolean);

  if (!recipients.length) {
    return { success: false, error: new Error("No recipients provided") };
  }

  try {
    const payload = {
      from,
      to: recipients,
      subject,
      html: html ?? (text ? `<pre>${text}</pre>` : undefined),
      text,
      reply_to: replyTo,
    };

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Resend email exception:", error);
    return { success: false, error };
  }
};

export default sendEmail;