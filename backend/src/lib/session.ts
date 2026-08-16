import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth";

export const getCurrentSession = async (headers: any) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(headers),
    });
    if (!session) {
      throw new Error("Session not found");
    }
    return session;
  } catch (err) {
    console.error(`Session retrieval failed: ${err}`);
  }
};
