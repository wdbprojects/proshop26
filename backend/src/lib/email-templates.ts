const BRAND = "Mercia";

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

const layout = ({
  title,
  intro,
  buttonLabel,
  url,
  footnote,
}: {
  title: string;
  intro: string;
  buttonLabel: string;
  url: string;
  footnote: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 24px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px;">
        <h1 style="margin: 0 0 16px; font-size: 22px; color: #0a1b2a;">${escapeHtml(BRAND)}</h1>
        <h2 style="margin: 0 0 12px; font-size: 18px; color: #111;">${escapeHtml(title)}</h2>
        <p style="color: #333; line-height: 1.5;">${intro}</p>
        <p style="margin: 24px 0;"><a href="${url}" style="background: #ff6a00; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">${escapeHtml(buttonLabel)}</a></p>
        <p style="color: #666; font-size: 13px; line-height: 1.5;">If the button doesn't work, copy this link into your browser:<br />${url}</p>
        <p style="color: #999; font-size: 12px;">${escapeHtml(footnote)}</p>
      </div>
    </div>
  `;
};

export const verifyEmailTemplate = (name: string, url: string) => {
  return {
    subject: `Verify your email for ${BRAND}`,
    html: layout({
      title: "Verify your email",
      intro: `Hi ${escapeHtml(name)}, confirm your email address to finish creating your account`,
      buttonLabel: "Veriy email",
      url: url,
      footnote: "If you didn't create an account, you can ignore this email.",
    }),
    text: `Hi ${name},\n\nConfirm your email address to finish creating your account:\n${url}\n\nIf you didn't create an account, ignore this email.`,
  };
};

export const resetPasswordTemplate = (name: string, url: string) => {
  return {
    subject: "Reset your ${BRAND} password",
    html: layout({
      title: "Reset your password",
      intro: `Hi ${escapeHtml(name)}, `,
      buttonLabel: "Choose a new password",
      url: url,
      footnote:
        "If you didn't request this, you can ignore this email. Your password won't change",
    }),
    text: `Hi ${name},\n\nReset your password (the link expires in one hour):\n${url}\n\nIf you didn't request this, ignore this email.`,
  };
};
