import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";
import { getEnv } from "../config/env";
import { runQrReconciliation } from "./qr-reconciler";

const ENV = getEnv();

// Keeps the Render free instance awake. Must hit the BACKEND (BASE_URL)

export const keepAliveJob = new CronJob("*/14 * * * *", () => {
  const url = new URL("/health", ENV.BASE_URL).href;
  const client = url.startsWith("https:") ? https : http;
  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("Keep-alive ping OK");
      else console.log("Keep-alive ping failed", res.statusCode);
    })
    .on("error", (event) => {
      console.error("Keep-alive ping error", event);
    });
});

// Every minute: confirm pending QR payments and cancel expired sessions
export const qrReconcileJob = new CronJob("* * * * *", () => {
  void runQrReconciliation();
});
