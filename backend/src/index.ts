import express, { NextFunction, Request, Response } from "express";
const app = express();
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getEnv } from "./config/env";
import cronJob from "./lib/cron";
import { polarWebhookHandler } from "./webhooks/polar";

/* ROUTES IMPORTS */
import getSession from "./routes/get-session.router";
import authRouter from "./routes/auth.router";
import productRouter from "./routes/product.router";
import streamRouter from "./routes/stream.router";
import checkoutRouter from "./routes/checkout.router";
import adminRouter from "./routes/admin.router";
import orderRouter from "./routes/order.router";
import { notFoundMiddleware } from "./middlewares/not-found";
import { errorHandlerMiddleware } from "./middlewares/error-handler";

const ENV = getEnv();
const rawJson = express.raw({ type: "application/json", limit: "1mb" });

/* WEBHOOKS */
app.post("/webhooks/polar", rawJson, (req, res) => {
  void polarWebhookHandler(req, res);
});

/* MIDDLEWARES */
app.use(
  cors({
    origin: [ENV.FRONTEND_URL, "https://pern-ecommerce-26.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

/* DEBUG MIDDLEWARE */
/* app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
	console.log("Origin:", req.headers.origin);
	console.log("Cookie header:", req.headers.cookie);
	next();
}); */
// http://localhost:5000/api/auth/sign-in/email

/* BETTER AUTH */
app.all("api/auth/*splat", toNodeHandler(auth));

/* ROUTES */
app.use("/api/auth", getSession);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/stream", streamRouter);
app.use("/api/checkout", checkoutRouter);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRouter);

/* CRON - FIX FOR RENDER IDLE ON FREE PLAN */
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* API HEALTHY CHECK */
app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to Ecommerce26 API - Powered by PostgreSQL, Drizzle ORM & Better Auth",
  });
});

// ERROR HANDLER MIDDLEWARE
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

/* SERVER LISTEN */
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  if (ENV.NODE_ENV === "production") {
    cronJob.start();
  }
});
