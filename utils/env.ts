/**
 * utils/env.ts
 * Single source of truth for all environment-driven configuration.
 */

export const ENV = {
  baseUrl: process.env.LMS_BASE_URL ?? "https://www.bissafety.app/v1/index.cfm?action=home.loginForm",
  username: process.env.LMS_USERNAME ?? "SAbdul9",
  password: process.env.LMS_PASSWORD ?? "2605Inte$#@",
  targetFolderName: process.env.LMS_FOLDER_NAME ?? "Test Automation Folder",
  documentTitle: process.env.LMS_DOCUMENT_TITLE ?? "DOC-TEST-AUTOMATION-001",
  folderDocsUrlPattern: /\/folders\/\d+\/documents/,
  saveDocumentApiPattern: "**/api/documents**",
  timeout: {
    short: 5_000,
    medium: 10_000,
    long: 20_000,
  },
} as const;
