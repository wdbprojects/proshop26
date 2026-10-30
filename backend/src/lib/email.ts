import { Resend } from "resend";
import { getEnv } from "../config/env";

const ENV = getEnv();
const resend = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailInput) => {
  /* No API key: print instead of sending, so local dev never needs email set up */
  if (!resend) {
    console.log(
      `[email not sent - no RESEND_API_KEY] to=${to}\n${subject}\n${text}`,
    );
    return;
  }

  /* Test mode: Resend's sandbox sender only delivers to the account owner */
  const redirected = ENV.EMAIL_TEST_RECIPIENT;
  const { error } = await resend.emails.send({
    from: ENV.EMAIL_FROM!,
    to: redirected ?? to,
    subject: redirected ? `[to: ${to}] ${subject}` : subject,
    html: html,
    text: text,
  });

  /* The SDK returns { data, error } instead if throwing */
  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email failed: ${error.message}`);
  }
};
