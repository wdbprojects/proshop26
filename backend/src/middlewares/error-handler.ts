// TODO: add middleware to handle errors
// app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
//   res.status(500).json({
//     error: "Internal server error",
//   });
// });

import { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);

  // known expected errors (validation failures, not-found, etc.) --safe to send the real status code and message to the client
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  /* zod validation errors thrown directly (ex. schema.parse(req.body) without a try/catch around just the parse call) --surface as 400 instead of a generic 500, since this is a client input problem */
  if (err && typeof err === "object" && "issues" in err) {
    return res.status(400).json({
      error: "Invalid request data",
      details: (err as { issues: unknown }).issues,
    });
  }

  /* anything else is unexpected --don't leak internal  error details, but DO keep the same { error } key shape so apiFetch's error extraction (`data?.error`) works consistently for every failure mode. */

  return res
    .status(500)
    .json({ error: "Something went wrong, please try again." });
};
