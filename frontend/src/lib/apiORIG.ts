import { ICheckoutRequest, ICreateProduct } from "@/config/types";

const base = process.env.NEXT_PUBLIC_API_URL;

// API FETCH
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiFetch = async <T = any>(
  path: string,
  opts: {
    method?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: ICreateProduct | ICheckoutRequest | Record<string, any>;
    headers?: Record<string, string>;
  },
): Promise<T> => {
  const { method = "GET", body } = opts;

  try {
    const response = await fetch(`${base}${path}`, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      const msg =
        typeof data?.error === "string" ? data.error : response.statusText;
      const err = new Error(typeof msg === "string" ? msg : "Request failed");
      throw err;
    }
    return data;
  } catch (err) {
    console.log(`Error from apiFetch catch(): ${err}`);
    throw err;
  }
};
