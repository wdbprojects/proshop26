// TODO: add middleware to handle errors
// app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
//   res.status(500).json({
//     error: "Internal server error",
//   });
// });

import { NextFunction, Request, Response } from "express";

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err);

  return res
    .status(500)
    .json({ message: "Something went wrong, please try again!!" });
};
