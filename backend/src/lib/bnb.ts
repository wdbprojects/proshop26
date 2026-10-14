import { z } from "zod";
import { getEnv } from "../config/env.js";

const ENV = getEnv();

const baseResponse = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
});

const idField = z.union([z.string(), z.string()]).optional();

const tokenResponseSchema = baseResponse;

const qrCreateResponseSchema = baseResponse.extend({
  id: idField,
  qr: z.string().optional(),
});

const qrStatusResponseSchema = baseResponse.extend({
  id: idField,
  qrId: z.number().optional(), // docs: 1 = used, 2 = unused, 3 = expired
});

export type BnbQrStatus = "used" | "unused" | "expired";

let cachedToken: { value: string; fetchedAt: number } | null = null;
const TOKEN_TTL_MS = 5 * 60 * 1000; // conservative until the bank tells us

const fetchToken = async () => {
  if (!ENV.BNB_ACCOUNT_ID || !ENV.BNB_AUTHORIZATION_ID) {
    throw new Error("BNB credentials are not configured");
  }
  const res = await fetch(`${ENV.BNB_AUTH_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accountId: ENV.BNB_ACCOUNT_ID,
      authorizationId: ENV.BNB_AUTHORIZATION_ID,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = tokenResponseSchema.parse(await res.json());
  // ASSUMPTION: the token is in `message`. Verify against the sandbox.

  if (!res.ok || !data.success || !data.message) {
    throw new Error(`BNB auth failed: ${data.message ?? res.status}`);
  }
  cachedToken = { value: data.message, fetchedAt: Date.now() };
  return data.message;
};

const getToken = async () => {
  if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_TTL_MS) {
    return cachedToken.value;
  }
  return fetchToken();
};

const bnbPost = async <T>(
  path: string,
  body: unknown,
  schema: z.ZodType<T>,
  retry = true,
): Promise<T> => {
  const token = await getToken();
  const res = await fetch(`${ENV.BNB_QR_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 401 && retry) {
    cachedToken = null;
    return bnbPost(path, body, schema, false);
  }
  return schema.parse(await res.json());
};

export const bnbCreateQr = async (input: {
  amountCents: number;
  gloss: string;
  expirationDate: string; // YYYY-MM-DD
  singleUse: boolean;
}) => {
  const data = await bnbPost(
    "/main/getQRWithImageAsync",
    {
      currency: "BOB",
      gloss: input.gloss,
      amount: (input.amountCents / 100).toFixed(2),
      singleUse: String(input.singleUse ?? true),
      expirationDate: input.expirationDate,
    },
    qrCreateResponseSchema,
  );
  if (!data.success || data.id == null || !data.qr) {
    throw new Error(`BNB QR generation failed: ${data.message ?? "unknown"}`);
  }
  return { qrId: String(data.id), qrImageBase64: data.qr };
};

export const bnbGetQrStatus = async (qrId: string): Promise<BnbQrStatus> => {
  const data = await bnbPost(
    "/main/getQRStatusAsync",
    { qrId },
    qrStatusResponseSchema,
  );
  if (!data.success) {
    throw new Error(`BNB status check failed: ${data.message ?? "unknown"}`);
  }
  switch (data.qrId) {
    case 1:
      return "used";
    case 2:
      return "unused";
    case 3:
      return "expired";
    default:
      throw new Error(`Unknown BNB QR status: ${data.qrId}`);
  }
};
