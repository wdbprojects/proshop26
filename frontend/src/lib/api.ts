const base = process.env.NEXT_PUBLIC_API_URL;

// API FETCH

export const apiFetch = async <T = unknown>(
  path: string,
  opts: {
    method?: string;
    body?: unknown;
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
