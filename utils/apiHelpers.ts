/**
 * utils/apiHelpers.ts
 * Reusable helpers for intercepting and asserting network responses.
 */

import { type Page, type Response } from "@playwright/test";
import { logger } from "./logger";

export function waitForSaveResponse(
  page: Page,
  urlPattern: string | RegExp,
  methods: string[] = ["POST", "PUT", "PATCH"],
  timeoutMs = 20_000
): Promise<Response> {
  logger.info(`Registering network listener for: ${urlPattern}`);

  return page.waitForResponse(
    (response: Response) => {
      const urlMatch =
        typeof urlPattern === "string"
          ? response.url().includes(urlPattern.replace(/\*\*/g, ""))
          : urlPattern.test(response.url());

      const methodMatch = methods.includes(
        response.request().method().toUpperCase()
      );

      return urlMatch && methodMatch;
    },
    { timeout: timeoutMs }
  );
}

export async function parseJsonBody(
  response: Response
): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    logger.warn("Response body is not valid JSON – skipping body assertion.");
    return {};
  }
}

export function isSuccessBody(body: Record<string, unknown>): boolean {
  if (Object.keys(body).length === 0) return true;

  return (
    body["success"] === true ||
    body["Success"] === true ||
    body["status"] === "ok" ||
    body["status"] === "success" ||
    body["error"] === null ||
    body["error"] === undefined
  );
}
