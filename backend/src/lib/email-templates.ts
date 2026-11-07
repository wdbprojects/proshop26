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
  details = "",
  buttonLabel,
  url,
  footnote,
}: {
  title: string;
  intro: string;
  details?: string;
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
        ${details}
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

const money = (cents: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
};

export type EmailOrderItem = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

export const orderConfirmedTemplate = (input: {
  name: string;
  orderId: string;
  items: EmailOrderItem[];
  totalCents: number;
  currency: string;
  url: string;
}) => {
  const short = input.orderId.slice(0, 8);
  const rows = input.items
    .map((item) => {
      return `<tr>
      <td style="padding: 6px 0px; color: #333333;">${item.quantity} x ${escapeHtml(item.name)}</td>
      <td style="padding: 6px 0px; text-align: right; color: #333333;">${item.quantity} x ${money(item.unitPriceCents * item.quantity, input.currency)}</td>
    </tr>`;
    })
    .join("");
  const details = `<table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
    ${rows}
    <tr>
      <td style="padding-top: 10px; border-top: 1px solid #EEEEEE; font-weight: bold; ">Total</td>
      <td style="padding-top: 10px; border-top: 1px solid #EEEEEE; text-align: right; font-weight: bold;">${money(input.totalCents, input.currency)}</td>
    </tr>
  </table>`;

  return {
    subject: `Order #${short} confirmed`,
    html: layout({
      title: `Thanks for your order, ${input.name}`,
      intro: `We received your payment for order <strong>#${short}</strong>. We'll email you again when it ships.`,
      details: details,
      buttonLabel: "View your order",
      url: input.url,
      footnote: `Thanks for your order, ${input.name}.\n\nOrder #${short} is confirmed. Total: ${money(input.totalCents, input.currency)}.\nView it: ${input.url}`,
    }),
    text: `Thanks for your order, ${input.name}.\n\nOrder #${short} is confirmed. Total: ${money(input.totalCents, input.currency)}.\nView it: ${input.url}`,
  };
};

export const orderShippedTemplate = (input: {
  name: string;
  orderId: string;
  trackingNumber: string | null;
  url: string;
}) => {
  const short = input.orderId.slice(0, 8);
  const details = input.trackingNumber
    ? `<p style="color: #333333;">Tracking number: <strong style="font-family: monospace;">${escapeHtml(input.trackingNumber)}</strong></p>`
    : "";
  return {
    subject: `Order #${short} is on its way`,
    html: layout({
      title: "Your order has shipped",
      intro: `Hi ${escapeHtml(input.name)}, order <strong>#${short}</strong> is on its way. The courier may call the phone number you gave us.`,
      details: details,
      buttonLabel: "View your order",
      url: input.url,
      footnote: "You'll see the status on the order page too.",
    }),
    text: `Hi ${input.name},\n\nOrder #${short} has shipped. ${input.trackingNumber ? `\nTracking: ${input.trackingNumber}` : ""}\nView it: ${input.url}`,
  };
};
