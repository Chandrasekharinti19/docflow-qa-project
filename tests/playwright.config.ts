import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  testDir: "./specs",
  timeout: 30000,
  fullyParallel: false,
  retries: 0,
  reporter: [["html"], ["list"]],
  globalTeardown: "./global-teardown.ts",
  use: {
  baseURL: process.env.BASE_URL,
  headless: false,
  screenshot: "only-on-failure",
  trace: "on-first-retry",
  video: "retain-on-failure",
  acceptDownloads: true,
},
});