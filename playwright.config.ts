import { defineConfig, devices } from "@playwright/test";
import path from "path";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    baseURL: process.env.LMS_BASE_URL ?? "https://your-lms.example.com",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
    headless: false,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  

  projects: [
    /**
     * "setup" project runs first and saves auth state to a file.
     * All other projects declare it as a dependency, so they start
     * already authenticated — no repeated login per test.
     */
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    
  ],

  outputDir: "test-results/",
});
