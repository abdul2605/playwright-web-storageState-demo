/**
 * fixtures/index.ts
 *
 * Extends Playwright's built-in `test` object with typed Page Object fixtures.
 */

import { test as base, expect } from "@playwright/test";
import {
  LoginPage,
  FoldersPage,
  AddDocumentPage,
  FolderDocumentsPage,
} from "../pages";

type LmsFixtures = {
  loginPage:            LoginPage;
  foldersPage:          FoldersPage;
  addDocumentPage:      AddDocumentPage;
  folderDocumentsPage:  FolderDocumentsPage;
};

const test = base.extend<LmsFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  foldersPage: async ({ page }, use) => {
    await use(new FoldersPage(page));
  },

  addDocumentPage: async ({ page }, use) => {
    await use(new AddDocumentPage(page));
  },

  folderDocumentsPage: async ({ page }, use) => {
    await use(new FolderDocumentsPage(page));
  },
});

export { test, expect };
