import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";
import { getEnv } from "../config/env";

const ENV = getEnv();

const job = new CronJob("*/14 * * * *", function () {
  const base = ENV.FRONTEND_URL;
  if (!base) return;
  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;
  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (event) =>
      console.error("Error while sending request", event),
    );
});

export default job;
