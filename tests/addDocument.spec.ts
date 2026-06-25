/**
 * tests/addDocument.spec.ts
 *
 * End-to-end test: add a document to a folder and verify it appears.
 *
 * Flow:
 *   1. Open Folders and select the target folder.
 *   2. Open the Add Document dialog, fill the form and attach a file.
 *   3. Optionally enable Terms/Notification and provide content.
 *   4. Submit while capturing the save API response.
 *   5. Assert the API indicates success and the UI updates accordingly.
 *   6. Verify navigation back to the folder and presence of the new document.
 */

// Custom Playwright test fixture with typed page-object fixtures.
import { test, expect } from "../fixtures";
import { AddDocumentPage } from "../pages";
import path from "path";
import fs from "fs";

// Reusable API helpers for waiting on the save call and validating JSON responses.
import {
  waitForSaveResponse,
  parseJsonBody,
  isSuccessBody,
} from "../utils/apiHelpers";

// Environment-driven configuration and URLs used by the test.
import { ENV } from "../utils/env";

// Static input data for the add-document flow.
import { addDocumentData } from "../test-data/documentData";

// Lightweight console logger for readable step output.
import { logger } from "../utils/logger";

//test.describe.skip("LMS – Document Management", () => {

test.describe("BIS – Document Management", () => {
  test("Add Document: fill dynamic form, intercept API, verify document in folder", async ({
    page,
    loginPage,
    foldersPage,
    folderDocumentsPage,
    addDocumentPage,
  }) => {
    // Ensure auth setup runs in the same browser/page context as this test.
    await test.step("Ensure auth session exists", async () => {
      const AUTH_FILE = path.join(__dirname, "../playwright/.auth/user.json");
      const authDir = path.dirname(AUTH_FILE);
      const context = page.context();

      if (!fs.existsSync(AUTH_FILE)) {
        if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
        logger.info(
          "Auth file missing — performing login and saving storage state",
        );
        await loginPage.open(ENV.baseUrl);
        await loginPage.loginAndWait(ENV.baseUrl, ENV.username, ENV.password);
        await context.storageState({ path: AUTH_FILE });
        logger.pass(`Storage state saved to ${AUTH_FILE}`);
        return;
      }

      logger.info(
        `Auth file found at ${AUTH_FILE}; restoring session into current context`,
      );
      const storedState = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));

      if (storedState.cookies?.length) {
        await context.addCookies(storedState.cookies);
      }

      if (storedState.origins?.length) {
        for (const originState of storedState.origins) {
          if (!originState.origin) continue;
          const pageForOrigin = await context.newPage();
          await pageForOrigin.goto(originState.origin);
          for (const storageItem of originState.localStorage ?? []) {
            await pageForOrigin.evaluate(
              ([key, value]) => localStorage.setItem(key, value),
              [storageItem.name, storageItem.value],
            );
          }
          await pageForOrigin.close();
        }
      }

      await page.goto(ENV.baseUrl);
    });

    let page1: any; // Declare popup page reference for reuse across steps

    await test.step("1 :Navigate to Add Document form", async () => {
      await expect(page.locator("#reactRoot")).toContainText("Add Course");
      await page.getByRole("link", { name: "Folders" }).click();
      await page
        .locator("#folderHolder")
        .getByRole("link", { name: "BIS Assessment Portal" })
        .click();
      const page1Promise = page.waitForEvent("popup");
      await page.locator("#formAsses").first().click();
      page1 = await page1Promise;
      await page1.getByRole("heading", { name: "Add Document" }).click();
      await expect(
        page1.getByRole("heading", { name: "Add Document" }),
      ).toBeVisible();
      await expect(page1.getByRole("heading")).toContainText("Add Document");
    });

    await test.step("2: Fill the form with dynamic values", async () => {
      // Page Object bound to the popup window that hosts the Add Document form.
      const addDocumentForm = new AddDocumentPage(page1);

      // Fill the form fields with dynamic data from the test-data/documentData.ts file

      await addDocumentForm.setDocumentTitle(ENV.documentTitle);
      await addDocumentForm.acceptTerms();

      await expect(addDocumentForm.acceptanceTermsCheckbox).toBeVisible();

      await addDocumentForm.configureNotificationAlert();

      const filePath = path.join(
        __dirname,
        "..",
        "fixtures",
        "Senior QA QC - Skill Assessment 2 - Instructions.pdf",
      );
      logger.info(`upload filePath: ${filePath}`);

      await addDocumentForm.attachFile(filePath, "Senior QA QC - Skill");

      // wait for the upload/loader overlay to fully clear before clicking Submit
      await addDocumentForm.waitForUploadToComplete();

      await expect(page1.locator('.modal.fade.in, [role="dialog"]'))
        .toBeHidden({ timeout: 10_000 })
        .catch(() => {});

      const aidInput = page1.locator("#ai-chatbot-dismiss-btn");

      // Click aidInput if visible, otherwise continue
      if (await aidInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await aidInput.click();
      }
    });

    await test.step("3: Intercept Network Requests", async () => {
      const submitButton2 = page1
        .getByRole("button", { name: "Submit" })
        .last();
      await submitButton2.scrollIntoViewIfNeeded();
      await expect(submitButton2).toBeEnabled({ timeout: 10_000 });

      // capture the save response after clicking Submit
      const [response] = await Promise.all([
        page1.waitForResponse(
          (resp: import("@playwright/test").Response) =>
            resp.request().method() === "POST" && // the save is a POST; navigation GETs are excluded
            [200, 201, 302].includes(resp.status()),
        ),
        submitButton2.click(),
      ]);

      logger.info(`Save status: ${response.status()}`);
      logger.info(`Save URL: ${response.url()}`);
      logger.info(`Request body: ${response.request().postData()}`);

      // parse only if JSON; CFM HTML responses won't have a JSON body
      const contentType = response.headers()["content-type"] || "";
      if (contentType.includes("application/json")) {
        const body = await response.json();
        logger.info("Save body: " + JSON.stringify(body, null, 2));
      } else {
        logger.info("Non-JSON response (likely HTML form post / redirect)");
      }

      expect([200, 201, 302]).toContain(response.status());
    });

    await test.step("4 : Verify Document was added Successfully", async () => {

      // Assert that the page navigated to the expected URL pattern for folder documents
      await expect(page1).toHaveURL(/adminDocuments|folderContents/);

      // Scope to the card for this document to avoid matching other cards.
      const card = page1
        .locator("div")
        .filter({ hasText: ENV.documentTitle })
        .last();

      // Assert the card is visible and contains the expected document title  
      await expect(
        card.getByText(ENV.documentTitle, { exact: true }),
      ).toBeVisible();

      // The card's checkbox (for bulk select)
      await expect(card.getByRole("checkbox")).toBeVisible();
    });
  });
});
