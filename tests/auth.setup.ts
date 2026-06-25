/**
 * tests/auth.setup.ts
 *
 * This setup file runs once before the test suite and authenticates a
 * user via the login page. It saves the browser storage state to
 * `playwright/.auth/user.json` so subsequent tests can reuse the session
 * without repeating login.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import { LoginPage } from "../pages";
import { ENV } from "../utils/env";
import { logger } from "../utils/logger";

export const AUTH_FILE = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate as admin", async ({ page }) => {
  logger.step("Running auth setup — logging in once for all tests");

  const loginPage = new LoginPage(page);
  await loginPage.loginAndWait(ENV.baseUrl, ENV.username, ENV.password);

  await expect(page).not.toHaveURL(/login/, { timeout: 5_000 });
  logger.pass(`Auth setup complete. Saving session to: ${AUTH_FILE}`);

  await page.context().storageState({ path: AUTH_FILE });
  console.log(`Storage state captured successfully to ${AUTH_FILE}`);
});
