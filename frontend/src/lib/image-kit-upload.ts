import { ImageKitAuthResponse } from "@/config/type-schemas";
import { apiFetch } from "@/lib/api";

const UPLOAD_URL: string = "https://upload.imagekit.io/api/v1/files/upload";

export const uploadImageToImageKit = async (
  file: File,
  getToken: string,
  opts: { folder?: string; fileName?: string } = {},
) => {
  const { folder = "products", fileName } = opts;

  // get auth tokens from endpoint
  const auth = (await apiFetch("/api/admin/imagekit/auth", {
    method: "GET",
  })) as ImageKitAuthResponse;

  const safeName =
    fileName ??
    (file.name.replace(/[^\w.-]/g, "_").slice(0, 200) ||
      `upload-${Date.now()}.jpg`);

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", safeName);
  form.append("publicKey", auth.publicKey);
  form.append("token", auth.token);
  form.append("expire", String(auth.expire));
  form.append("folder", folder);

  const res = await fetch(UPLOAD_URL, { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) {
    console.log("[ImageKit upload]", res.status, data);
    throw new Error("ImageKit upload failed");
  }

  if (!data.url) {
    console.log("[ImageKit upload] missing url in response", data);
    throw new Error("ImageKit upload failed");
  }
  return { url: data.url, fileId: data.fileId ?? null };
};
