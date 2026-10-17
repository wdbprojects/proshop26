const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export const apiFetch = async <T = unknown>(
  path: string,
  opts: ApiFetchOptions,
): Promise<T> => {
  if (!BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not set");
  }
  const { method = "GET", body, headers } = opts;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  /* your 404 handler replies with plain text, not JSON, so a failed parse must not crash the request */
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : response.statusText || "Request failed";
    throw new ApiError(response.status, message);
  }

  return data as T;
};
