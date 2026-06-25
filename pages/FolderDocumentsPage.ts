/**
 * pages/FolderDocumentsPage.ts
 *
 * Represents the document list view inside a specific folder.
 */

import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ENV } from "../utils/env";
import { logger } from "../utils/logger";

export class FolderDocumentsPage extends BasePage {
  readonly addDocumentButton: Locator;
  readonly documentList: Locator;

  constructor(page: Page) {
    super(page);

    this.addDocumentButton = page
      .getByRole("button", { name: /^add$|^\+$|add document|new document/i })
      .or(page.getByTitle(/add document|new document/i))
      .first();

    this.documentList = page.locator(
      "[data-testid='document-list'], .document-list, ul.documents, table.documents"
    );
  }

  async clickAddDocument(): Promise<void> {
    logger.step("Clicking Add (+) button to open Add Document form");
    await this.waitForVisible(this.addDocumentButton);
    await this.addDocumentButton.click();
  }

  async assertOnFolderDocumentsPage(): Promise<void> {
    await this.waitForUrl(ENV.folderDocsUrlPattern, ENV.timeout.long);
    await this.assertUrl(ENV.folderDocsUrlPattern, "/folders/:id/documents");
    logger.pass("Redirected back to folder documents page");
  }

  async assertDocumentVisible(title: string): Promise<void> {
    logger.step(`Asserting document visible: "${title}"`);
    const documentEntry = this.page.getByText(title, { exact: false });
    await expect(
      documentEntry,
      `Document titled "${title}" should be visible after submission`
    ).toBeVisible({ timeout: ENV.timeout.long });
    logger.pass(`Document visible in list: "${title}"`);
  }
}
