/**
 * pages/BasePage.ts
 *
 * Every Page Object extends this class.
 * It holds the Playwright `page` instance and exposes shared utilities
 * (navigation, waiting, common assertions) so child classes stay DRY.
 */

import { type Page, type Locator, expect } from "@playwright/test";
import { logger } from "../utils/logger";

export abstract class BasePage {
  /** The Playwright Page under test */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /** Navigate to an absolute or relative URL */
  async goto(url: string): Promise<void> {
    logger.info(`Navigating to: ${url}`);
    await this.page.goto(url);
  }

  /** Wait until the current URL matches a string or RegExp */
  async waitForUrl(
    pattern: string | RegExp,
    timeoutMs = 15_000
  ): Promise<void> {
    await this.page.waitForURL(pattern, { timeout: timeoutMs });
    logger.info(`URL confirmed: ${this.page.url()}`);
  }

  /** Return the current page URL */
  currentUrl(): string {
    return this.page.url();
  }

  // ── Waiting helpers ────────────────────────────────────────────────────────

  /** Wait for a locator to be visible */
  async waitForVisible(
    locator: Locator,
    timeoutMs = 10_000
  ): Promise<void> {
    await locator.waitFor({ state: "visible", timeout: timeoutMs });
  }

  /** Wait for a locator to be attached to the DOM (may still be hidden) */
  async waitForAttached(
    locator: Locator,
    timeoutMs = 10_000
  ): Promise<void> {
    await locator.waitFor({ state: "attached", timeout: timeoutMs });
  }

  // ── Assertion helpers ──────────────────────────────────────────────────────

  /** Assert locator is visible on screen */
  async assertVisible(locator: Locator, description: string): Promise<void> {
    await expect(locator, `Expected "${description}" to be visible`).toBeVisible();
    logger.pass(`Visible: ${description}`);
  }

  /** Assert locator is attached to the DOM */
  async assertAttached(locator: Locator, description: string): Promise<void> {
    await expect(locator, `Expected "${description}" to be in the DOM`).toBeAttached();
    logger.pass(`Attached (in DOM): ${description}`);
  }

  /** Assert the current URL matches a pattern */
  async assertUrl(pattern: RegExp, description: string): Promise<void> {
    expect(
      this.page.url(),
      `Expected URL to match "${description}"`
    ).toMatch(pattern);
    logger.pass(`URL matches: ${description}`);
  }

  // ── Form helpers ───────────────────────────────────────────────────────────

  /** Clear a text input and type a new value */
  async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  /** Tick a checkbox only if it is not already checked */
  async checkIfUnchecked(locator: Locator): Promise<void> {
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }
}
