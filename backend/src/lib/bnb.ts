import { z } from "zod";
import { getEnv } from "../config/env";

const ENV = getEnv();
const TIMEOUT_MS = 10_000;

export const isBnbEnabled =
  ENV.BNB_MODE === "fake" ||
  Boolean(ENV.BNB_ACCOUNT_ID && ENV.BNB_AUTHORIZATION_ID);

// Bolivia is UTC-4 all year. The bank's dates are local
export const toBoliviaDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz",
  }).format(date); // YYYY-MM-DD
};

// The bank sends "" or "0" when there is no voucher
const cleanVoucher = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "0" ? trimmed : null;
};

export type BnbQrStatus = "unused" | "used" | "expired" | "error" | "unknown";

export type BnbQrDetail = {
  amountCents: number;
  currency: string | null;
  voucherId: string | null;
};

export interface BnbClient {
  createQr(input: {
    amountCents: number;
    gloss: string;
    additionalData: string;
    expirationDate: string; // YYYY-MM-DD
  }): Promise<{ qrId: string; qrImageBase64: string }>;
  getQrStatus(
    qrId: string,
  ): Promise<{ status: BnbQrStatus; voucherId: string | null }>;
  cancelQr(qrId: string): Promise<void>;
  getQrDetail(
    qrId: string,
    generationDate: string,
  ): Promise<BnbQrDetail | null>;
}

// LIVE CLIENT
const baseResponse = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
});
const idField = z.union([z.string(), z.number()]).optional();

const qrCreateResponseSchema = baseResponse.extend({
  id: idField,
  qr: z.string().optional(), // base64 PNG
});

const qrStatusResponseSchema = baseResponse.extend({
  id: idField,
  statusId: z.number().optional(),
  voucherId: z.string().nullable().optional(),
});

const qrByDateResponseSchema = baseResponse.extend({
  dTOqrDetails: z
    .array(
      z.object({
        id: idField,
        amount: z.number().optional(),
        currency: z.string().nullable().optional(),
        voucherId: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
});

// PDF: 1= No usado, 2 = Usado, 3 = Expirado, 4 = Con error
const STATUS_BY_ID: Record<number, BnbQrStatus> = {
  1: "unused",
  2: "used",
  3: "expired",
  4: "error",
};

type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;
const FALLBACK_TTL_MS = 5 * 60 * 1000;
const EXPIRY_MARGIN_MS = 60 * 1000;

const readJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

// Only reads our own token's exp claim, no signature check needed
const readJwtExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf-8"),
    );
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

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
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const parsed = baseResponse.safeParse(await readJson(res));
  if (
    !res.ok ||
    !parsed.success ||
    !parsed.data.success ||
    !parsed.data.message
  ) {
    throw new Error(`BNB auth failed (HTTP ${res.status})`);
  }
  const token = parsed.data.message;
  cachedToken = {
    value: token,
    expiresAt: readJwtExpiry(token) ?? Date.now() + FALLBACK_TTL_MS,
  };
  return token;
};

const getToken = async () => {
  if (cachedToken && Date.now() < cachedToken.expiresAt - EXPIRY_MARGIN_MS) {
    return cachedToken.value;
  }
  return fetchToken;
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
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (res.status === 401 && retry) {
    cachedToken = null;
    return bnbPost(path, body, schema, false);
  }
  const parsed = schema.safeParse(await readJson(res));
  if (!parsed.success) {
    throw new Error(`BNB ${path} unexpected response (HTTP ${res.status})`);
  }
  return parsed.data;
};

const toQrNumber = (qrId: string) => {
  const num = Number(qrId);
  if (!Number.isInteger(num)) throw new Error(`Invalid QR id: ${qrId}`);
  return num;
};

const liveBnb: BnbClient = {
  async createQr(input) {
    const data = await bnbPost(
      "/main/getQRWithImageAsync",
      {
        currency: "BOB",
        gloss: input.gloss,
        amount: input.amountCents / 100,
        singleUse: true,
        expirationDate: input.expirationDate,
        additionalData: input.additionalData,
        destinationAccountId: "1", // 1 = BOB account
      },
      qrCreateResponseSchema,
    );
    if (!data.success || data.id == null || !data.qr) {
      throw new Error(`BNB QR generation failed: ${data.message ?? "unknown"}`);
    }
    return { qrId: String(data.id), qrImageBase64: data.qr };
  },

  async getQrStatus(qrId) {
    const data = await bnbPost(
      "/main/getQRStatusAsync",
      {
        qrId: toQrNumber(qrId),
      },
      qrStatusResponseSchema,
    );
    if (!data.success || data.statusId == null) {
      throw new Error(`BNB status check failed: ${data.message ?? "unknown"}`);
    }
    return {
      status: STATUS_BY_ID[data.statusId] ?? "unknown",
      voucherId: cleanVoucher(data.voucherId),
    };
  },

  async cancelQr(qrId) {
    const data = await bnbPost(
      "/main/CancelQRByIdAsync",
      { qrId: toQrNumber(qrId) },
      baseResponse,
    );
    if (!data.success) {
      throw new Error(`BNB QR cancel failed: ${data.message ?? "unknown"}`);
    }
  },

  async getQrDetail(qrId, generationDate) {
    const data = await bnbPost(
      "/main/getQRbyGenerationDateASync",
      { generationDate },
      qrByDateResponseSchema,
    );
    if (!data.success) {
      throw new Error(`BNB by-date failed: ${data.message ?? "unknown"}`);
    }
    const item = (data.dTOqrDetails ?? []).find((row) => {
      return String(row.id) === qrId;
    });
    if (!item || item.amount === undefined) return null;
    return {
      amountCents: Math.round(item.amount * 100),
      currency: item.currency ?? null,
      voucherId: cleanVoucher(item.voucherId),
    };
  },
};

// FAKE CLIENT (local development only)
type FakeQr = {
  amountCents: number;
  statusId: number;
  voucherId: string | null;
  generationDate: string;
};

const fakeQrs = new Map<string, FakeQr>();
let fakeSequence = 100000;

// 1x1 PNG placeholder
const FAKE_QR_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export const fakeBnbMarkPaid = (qrId: string) => {
  const qr = fakeQrs.get(qrId);
  if (!qr) return false;
  qr.statusId = 2;
  qr.voucherId = `FAKE${qrId}`;
  return true;
};

const fakeBnb: BnbClient = {
  async createQr(input) {
    const qrId = String(++fakeSequence);
    fakeQrs.set(qrId, {
      amountCents: input.amountCents,
      statusId: 1,
      voucherId: null,
      generationDate: toBoliviaDate(new Date()),
    });
    return { qrId: qrId, qrImageBase64: FAKE_QR_PNG };
  },

  async getQrStatus(qrId) {
    const qr = fakeQrs.get(qrId);
    if (!qr) throw new Error(`Fake BNB: unknown QR ${qrId}`);
    return {
      status: STATUS_BY_ID[qr.statusId] ?? "unknown",
      voucherId: qr.voucherId,
    };
  },

  async cancelQr(qrId) {
    const qr = fakeQrs.get(qrId);
    if (!qr) throw new Error(`Fake BNB: unknown QR ${qrId}`);
    if (qr.statusId === 2) throw new Error("Fake BNB: QR already paid");
    qr.statusId = 3; // real value after cancel is still to be confirmed
  },

  async getQrDetail(qrId) {
    const qr = fakeQrs.get(qrId);
    if (!qr) return null;
    return {
      amountCents: qr.amountCents,
      currency: "BOB",
      voucherId: qr.voucherId,
    };
  },
};

export const bnb: BnbClient = ENV.BNB_MODE === "fake" ? fakeBnb : liveBnb;
