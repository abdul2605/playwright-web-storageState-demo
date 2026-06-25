/**
 * test-data/documentData.ts
 */

import path from "path";

export interface DocumentFormData {
  title: string;
  filePath: string;
  includeTerms: boolean;
  includeNotification: boolean;
  termsText?: string;
  notificationMessage?: string;
}

export const addDocumentData: DocumentFormData = {
  title: `Automated Test Document – ${Date.now()}`,
  filePath: path.resolve(__dirname, "../fixtures/test-document.pdf"),
  includeTerms: true,
  includeNotification: true,
  termsText: "I agree to the terms and conditions stated above.",
  notificationMessage: "This document has been added for review.",
};
