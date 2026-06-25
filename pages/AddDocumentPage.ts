/**
 * pages/AddDocumentPage.ts
 *
 * Page Object for the Add Document form.
 */

import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { type DocumentFormData } from "../test-data/documentData";
import { logger } from "../utils/logger";
import { ENV } from "../utils/env";

export class AddDocumentPage extends BasePage {
  readonly formContainer: Locator;

  /** Exact-name elements as rendered in the Add Document popup */
  readonly documentTitleInput: Locator;
  readonly acceptanceTermsCheckbox: Locator;

  readonly titleInput: Locator;
  readonly uploadButton: Locator;
  readonly fileInput: Locator;

  readonly termsCheckbox: Locator;
  readonly notificationCheckbox: Locator;

  readonly submitButton: Locator;

  readonly termsSection: Locator;
  readonly termsTextArea: Locator;
  readonly notificationSection: Locator;
  readonly notificationEditor: Locator;

  /** Notification-alert section elements as rendered in the popup */
  readonly includeMessageSection: Locator;
  readonly notificationAlertCheckbox: Locator;
  readonly notificationSubjectField: Locator;
  readonly selectLanguageLabel: Locator;
  readonly customVariablesLabel: Locator;
  readonly editMessageLabel: Locator;
  readonly defaultMessagePreview: Locator;

  /** Upload elements */
  readonly loaderOverlay: Locator;

  constructor(page: Page) {
    super(page);

    this.documentTitleInput = page.getByRole("textbox", {
      name: "Document Title:",
    });

    this.acceptanceTermsCheckbox = page.getByRole("checkbox", {
      name: "Include Acceptance Terms/",
    });

    this.formContainer = page
      .getByRole("dialog")
      .or(
        page.locator(
          "form[data-testid='add-document-form'], " +
            "form.add-document, " +
            "[data-testid='add-document-page']",
        ),
      );

    this.titleInput = this.formContainer
      .getByLabel(/document title/i)
      .or(this.formContainer.getByPlaceholder(/title/i));

    this.uploadButton = this.formContainer.getByRole("button", {
      name: /\+?\s*upload/i,
    });

    this.fileInput = page.locator('input[type="file"]').last();

    this.termsCheckbox = this.formContainer.getByLabel(
      /include acceptance terms\s*[/\\]?\s*conditions/i,
    );

    this.notificationCheckbox = this.formContainer.getByLabel(
      /include notification alert/i,
    );

    this.submitButton = this.formContainer
      .getByRole("button", { name: /^submit$|^save$|add document/i })
      .or(page.getByRole("button", { name: /^submit$|^save$|add document/i }))
      .last();

    this.termsSection = this.formContainer.locator(
      "[data-testid='terms-section'], " +
        ".terms-section, " +
        "#terms-section, " +
        "section:has-text('Terms')",
    );

    this.termsTextArea = this.termsSection
      .getByRole("textbox")
      .or(this.termsSection.locator("textarea, [contenteditable]"))
      .first();

    this.notificationSection = this.formContainer.locator(
      "[data-testid='notification-section'], " +
        ".notification-section, " +
        "#notification-section, " +
        "section:has-text('Notification')",
    );

    this.notificationEditor = this.notificationSection
      .getByRole("textbox")
      .or(this.notificationSection.locator("textarea, [contenteditable]"))
      .first();

    this.includeMessageSection = page.locator(".row.includeMsgSection");
    this.notificationAlertCheckbox = page.getByRole("checkbox", {
      name: "Include Notification Alert",
    });
    this.notificationSubjectField = page.locator("#notificationSubject");
    this.selectLanguageLabel = page.getByText("Select a language to edit:");
    this.customVariablesLabel = page.getByText("Custom Variables:");
    this.editMessageLabel = page.getByText("Edit the message to customize:");
    this.defaultMessagePreview = page.getByText("Hi {First Name},A new file");

    this.loaderOverlay = page.locator("#loaderOverlay");
  }

  async waitForForm(): Promise<void> {
    logger.step("Waiting for Add Document form to appear");
    await this.waitForVisible(this.formContainer, ENV.timeout.medium);
    logger.pass("Add Document form is visible");
  }

  async enterTitle(title: string): Promise<void> {
    logger.step(`Entering document title: "${title}"`);
    await this.fillInput(this.titleInput, title);
  }

  /** Fill the "Document Title:" field exactly as rendered in the popup */
  async setDocumentTitle(title: string): Promise<void> {
    logger.step(`Setting document title: "${title}"`);
    await this.documentTitleInput.click();
    await this.documentTitleInput.fill(title);
  }

  /** Tick the "Include Acceptance Terms/Conditions" checkbox */
  async acceptTerms(): Promise<void> {
    logger.step("Checking 'Include Acceptance Terms/' checkbox");
    await this.acceptanceTermsCheckbox.check();
  }

  /**
   * Enable the Notification Alert section, open the message editor and verify
   * its default content is rendered (custom variables + editable preview).
   */
  async configureNotificationAlert(): Promise<void> {
    logger.step("Configuring Notification Alert section");
    await this.includeMessageSection.click();
    await this.notificationAlertCheckbox.check();
    await this.notificationSubjectField.click();
    await this.selectLanguageLabel.click();
    await expect(this.customVariablesLabel).toBeVisible();
    await this.editMessageLabel.click();
    await expect(this.editMessageLabel).toBeVisible();
    await expect(this.defaultMessagePreview).toBeVisible();
    logger.pass("Notification Alert section configured");
  }

  /**
   * Attach a file to the upload input and confirm its preview appears.
   * `previewText` defaults to the file's base name; pass a substring when the
   * UI truncates the displayed name.
   */
  async attachFile(filePath: string, previewText?: string): Promise<void> {
    logger.step(`Attaching file: ${filePath}`);
    await this.fileInput.setInputFiles(filePath);

    const expected = previewText ?? filePath.split("/").pop() ?? filePath;
    await expect(this.page.getByText(expected, { exact: false })).toBeVisible();
    logger.pass(`File attached and preview visible: "${expected}"`);
  }

  /** Wait for the upload/loader overlay to clear before submitting */
  async waitForUploadToComplete(): Promise<void> {
    logger.step("Waiting for upload overlay to clear");
    await this.loaderOverlay
      .waitFor({ state: "hidden", timeout: 30_000 })
      .catch(() => {});
  }

  async uploadFile(filePath: string): Promise<void> {
    logger.step(`Uploading file: ${filePath}`);
    await this.uploadButton.click();
    await this.fileInput.setInputFiles(filePath);

    const fileName = filePath.split("/").pop() ?? filePath;
    const filePreview = this.page.getByText(fileName, { exact: false });
    await expect(filePreview).toBeVisible({ timeout: ENV.timeout.medium });
    logger.pass(`File attached and preview visible: "${fileName}"`);
  }

  async checkTermsAndConditions(): Promise<void> {
    logger.step("Checking 'Include Acceptance Terms/Conditions' checkbox");
    await this.checkIfUnchecked(this.termsCheckbox);
  }

  async fillTermsText(text: string): Promise<void> {
    if (
      await this.termsTextArea.isVisible({ timeout: 3_000 }).catch(() => false)
    ) {
      logger.step("Filling terms text area");
      await this.fillInput(this.termsTextArea, text);
    }
  }

  async checkNotificationAlert(): Promise<void> {
    logger.step("Checking 'Include Notification Alert' checkbox");
    await this.checkIfUnchecked(this.notificationCheckbox);
  }

  async fillNotificationMessage(message: string): Promise<void> {
    if (
      await this.notificationEditor
        .isVisible({ timeout: 3_000 })
        .catch(() => false)
    ) {
      logger.step("Filling notification message");
      await this.fillInput(this.notificationEditor, message);
    }
  }

  async submit(): Promise<void> {
    logger.step("Clicking Submit button");
    await expect(this.submitButton).toBeEnabled({ timeout: ENV.timeout.short });
    await this.submitButton.click();
  }

  async fillForm(data: DocumentFormData): Promise<void> {
    await this.enterTitle(data.title);
    await this.uploadFile(data.filePath);

    if (data.includeTerms) {
      await this.checkTermsAndConditions();
      if (data.termsText) await this.fillTermsText(data.termsText);
    }

    if (data.includeNotification) {
      await this.checkNotificationAlert();
      if (data.notificationMessage) {
        await this.fillNotificationMessage(data.notificationMessage);
      }
    }
  }

  async assertTermsSectionVisible(): Promise<void> {
    logger.step("Asserting Terms section is visible in the DOM");
    await expect(
      this.termsSection,
      "Terms section should be visible after checking the Terms checkbox",
    ).toBeVisible({ timeout: ENV.timeout.short });

    await expect(
      this.termsSection,
      "Terms section should be attached to the DOM",
    ).toBeAttached();

    logger.pass("Terms section is visible and attached to the DOM");
  }

  async assertNotificationSectionVisible(): Promise<void> {
    logger.step("Asserting Notification section is visible in the DOM");
    await expect(
      this.notificationSection,
      "Notification section should be visible after checking the Notification checkbox",
    ).toBeVisible({ timeout: ENV.timeout.short });

    await expect(
      this.notificationSection,
      "Notification section should be attached to the DOM",
    ).toBeAttached();

    logger.pass("Notification section is visible and attached to the DOM");
  }
}
