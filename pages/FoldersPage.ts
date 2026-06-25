/**
 * pages/FoldersPage.ts
 *
 * Represents the Folders listing page — the view where admins see all folders.
 */

import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { logger } from "../utils/logger";

export class FoldersPage extends BasePage {
  // ── Locators ───────────────────────────────────────────────────────────────
  readonly foldersNavLink: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.foldersNavLink = page.getByRole("link", { name: /^folders$/i });
    this.pageHeading    = page.getByRole("heading", { name: /folders/i });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Click "Folders" in the main navigation */
  async navigateToFolders(): Promise<void> {
    logger.step("Navigating to Folders section");
    await this.foldersNavLink.click();
    await this.waitForUrl(/\/folders/, 10_000);
  }

  /**
   * Open a specific folder by its display name.
   * Handles both table-row layouts and card/tile layouts.
   */
  async openFolder(folderName: string): Promise<void> {
    logger.step(`Opening folder: "${folderName}"`);

    // Strategy 1: folder rendered as a table row
    const rowLocator = this.page.getByRole("row", { name: folderName });

    // Strategy 2: folder rendered as a card / tile
    const cardLocator = this.page
      .getByRole("button", { name: folderName })
      .or(this.page.getByText(folderName, { exact: false }).first());

    if (await rowLocator.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await rowLocator.click();
    } else {
      await cardLocator.click();
    }

    logger.info(`Clicked folder: "${folderName}"`);
  }

  // ── Assertions ─────────────────────────────────────────────────────────────

  async assertOnFoldersPage(): Promise<void> {
    await this.assertVisible(this.pageHeading, "Folders page heading");
  }
}
