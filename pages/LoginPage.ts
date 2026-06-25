/**
 * pages/LoginPage.ts
 *
 * Encapsulates all interactions with the LMS login screen.
 */

import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { logger } from "../utils/logger";

export class LoginPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput    = page.locator('#username');
    this.passwordInput = page.locator('#password');
    
    this.submitButton  = page.getByRole('button', { name: 'Log In' });
    this.errorMessage  = page.getByRole("alert").or(page.locator(".error-message, [data-testid='login-error']"));
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Navigate to the login page */
  async open(baseUrl: string): Promise<void> {
    await this.goto(`${baseUrl}/login`);
    logger.step("Opened login page");
  }

  /** Fill credentials and submit the form */
  async login(username: string, password: string): Promise<void> {
    logger.step(`Logging in as: ${username}`);
    await this.fillInput(this.emailInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.submitButton.click();
  }

  /** Full login flow: navigate → fill → submit → wait for redirect */
  async loginAndWait(
    baseUrl: string,
    username: string,
    password: string
  ): Promise<void> {
    await this.open(baseUrl);
    await this.login(username, password);
    // Wait until the browser leaves the login page
    await this.page.waitForURL(
      (url) => !url.pathname.includes("/login"),
      { timeout: 15_000 }
    );
    logger.pass("Login successful — redirected away from /login");
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertErrorVisible(): Promise<void> {
    await this.assertVisible(this.errorMessage, "Login error message");
  }
}
