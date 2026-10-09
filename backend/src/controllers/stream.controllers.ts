import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import {
  getStreamChatServer,
  streamChatDisplayName,
  streamUserId,
} from "../lib/stream";
import { getCurrentSession } from "../lib/session";

const ENV = getEnv();

/* requireAuth (stream.router.ts) guarantees req.session  is set below. This also fixes a real bug from the previous version: the old manual check did `res.status(401).json(....) without returning, do sn unauthenticated request fell through and tried to build a token for an undefined user , then called res.json(...) a second time - which throws "headers already sent". That code path can no longer be reached now that the router rejects unauthenticated requests first.`*/

export const createStreamToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.session!.user;
    const server = getStreamChatServer(ENV);

    const name = streamChatDisplayName(
      user?.role,
      user?.name ? user?.name : "Unnamed",
      user?.email ? user?.email : "No email provided",
    );
    const image = user?.image ? user?.image : undefined;
    const sid = streamUserId(user?.id ? user?.id : "");

    await server.upsertUser({ id: sid, name: name, image: image });

    const token = server.createToken(sid);

    res.json({
      token: token,
      apiKey: ENV.STREAM_API_KEY,
      name: name,
      userId: sid,
    });
  } catch (error) {
    next(error);
  }
};
