# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Playwright + TypeScript E2E suite that automates the **BIS Safety** web app
(`bissafety.app`) — a ColdFusion (`.cfm`) application. The headline scenario is
adding a document to a folder ("BIS Assessment Portal") and verifying the save.
The README calls it a generic "LMS"; the live target is BIS, so responses are
HTML/redirects (CFM form posts), not JSON.

## Commands

```bash
npm install                       # install deps
npx playwright install chromium   # install browser binary (required first run)

npm test                          # run all tests
npm run test:chrome               # chromium project only
npm run test:login                # tests/login.spec.ts only
npm run test:headed               # visible browser
npm run test:debug                # Playwright inspector / step-through
npm run report                    # open the HTML report
npm run clean                     # wipe test-results, playwright-report, playwright/.auth

# Run a single test file / single test:
npx playwright test tests/addDocument.spec.ts
npx playwright test -g "Add Document"
```

Note: the README mentions `npm run test:document` — that script does **not**
exist in `package.json`. Use the `npx playwright test <file>` form instead.

## Configuration & secrets

All runtime config flows through [utils/env.ts](utils/env.ts) (`ENV`), which
reads env vars with hardcoded fallbacks. Override via env vars rather than
editing the file:

- `LMS_BASE_URL`, `LMS_USERNAME`, `LMS_PASSWORD`, `LMS_FOLDER_NAME`

`env.ts` currently contains real-looking default credentials and a live BIS
URL — treat these as sensitive; prefer setting env vars over committing changes
to those defaults.

Playwright config ([playwright.config.ts](playwright.config.ts)): single
`chromium` project, `headless: false`, `fullyParallel: false`, 1 worker, retries
only in CI. Reporters: list + HTML (`playwright-report/`) + JSON
(`test-results/results.json`).

## Architecture

### Page Object Model
Page Objects live in [pages/](pages/), all extending
[BasePage](pages/BasePage.ts) (shared `goto`/`waitForUrl`/`assertVisible`/
`fillInput`/`checkIfUnchecked` helpers). Barrel export via `pages/index.ts`.
Classes: `LoginPage`, `FoldersPage`, `AddDocumentPage`, `FolderDocumentsPage`.

### Custom fixtures (important)
Tests should import `test`/`expect` from [fixtures/index.ts](fixtures/index.ts),
**not** from `@playwright/test`. The fixture injects ready-to-use POM instances
(`loginPage`, `foldersPage`, `addDocumentPage`, `folderDocumentsPage`) — no
`new` in tests. (`login.spec.ts` currently bypasses this and uses `base` +
manual `new LoginPage`.)

### Auth setup
[tests/auth.setup.ts](tests/auth.setup.ts) is a Playwright `setup` project
(matched by `*.setup.ts`) that logs in once and saves storage state to
`playwright/.auth/user.json`. The `chromium` project declares `setup` as a
dependency and loads that file via `storageState`, so tests start
authenticated.

### Supporting utils
- [utils/apiHelpers.ts](utils/apiHelpers.ts): `waitForSaveResponse` (register
  the `waitForResponse` listener **before** clicking submit to avoid the
  race), `parseJsonBody`, `isSuccessBody` (tolerant — treats an empty body as
  success since CFM returns HTML).
- [utils/logger.ts](utils/logger.ts): timestamped console logger
  (`info`/`step`/`pass`/`warn`/`fail`).
- [test-data/documentData.ts](test-data/documentData.ts): all form input values
  in one place (`addDocumentData` / `DocumentFormData`).

## Key behavioral nuances (read before editing the main test)

- **The main E2E test bypasses the POM.** Despite the README's POM-purity
  claim, [tests/addDocument.spec.ts](tests/addDocument.spec.ts) drives the app
  mostly with raw Playwright locators. It:
  - Re-establishes auth inline (recreates cookies/localStorage from the auth
    file) instead of relying solely on `storageState`.
  - Opens the Add Document form in a **popup window** (`page.waitForEvent('popup')`),
    so most interactions target `page1`, not `page`. Keep popup vs main-page
    context straight when editing.
  - Captures the save via `Promise.all([page1.waitForResponse(...POST...),
    submitButton.click()])` and asserts status ∈ `[200, 201, 302]` (HTML
    redirect, not JSON).
  - Contains large commented-out blocks (the original POM-based flow). The
    `AddDocumentPage` helpers (`assertTermsSectionVisible`, etc.) are only
    partially wired in.

- **Upload fixture filename.** Tests upload
  `fixtures/Senior QA QC - Skill Assessment 2 - Instructions.pdf`. The README
  references `fixtures/test-document.pdf`, which is not present — match the
  actual filename in `fixtures/`.

- **tsconfig path aliases** (`@pages/*`, `@utils/*`, etc.) are defined but the
  code uses relative imports throughout.
