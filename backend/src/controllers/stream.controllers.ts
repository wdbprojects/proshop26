import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import {
  getStreamChatServer,
  streamChatDisplayName,
  streamUserId,
} from "../lib/stream";
import { getCurrentSession } from "../lib/session";

const ENV = getEnv();

export const createStreamToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      res.status(401).json({ error: " Unauthorized!!" });
    }

    const server = getStreamChatServer(ENV);

    const user = session?.user;

    const name = streamChatDisplayName(
      user?.role,
      user?.name ? user?.name : "Unnamed",
      user?.email ? user?.email : "No email provided",
    );
    const image = user?.image ? user?.image : undefined;
    const sid = streamUserId(user?.id ? user?.id : "");

    await server.upsertUser({ id: sid, name: name, image: image });

    const token = server.createToken(sid);

    res.json({ token: token, apiKey: ENV.STREAM_API_KEY, name: name, userId: sid });
  } catch (error) {
    next(error);
  }
};
