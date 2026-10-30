import { sendEmail } from "../src/lib/email";
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
} from "../src/lib/email-templates";

const to = process.argv[2];
if (!to) {
  console.error("Usage: bun run email:test ronyortizop@gmail.com");
  process.exit(1);
}

const main = async () => {
  await sendEmail({
    to: to,
    ...verifyEmailTemplate(
      "Test User",
      "http://localhost:3000/auth/verify-email?token=demo",
    ),
  });
  await sendEmail({
    to: to,
    ...resetPasswordTemplate(
      "Test User",
      "http://localhost:3000/auth/reset-password?token=demo",
    ),
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
