# BIS Playwright Automation Suite

A Playwright + TypeScript automation project using the **Page Object Model (POM)**.
It automates the **BIS Safety** web app (`bissafety.app`) — a ColdFusion (`.cfm`)
application. The headline scenario opens a folder, adds a document via the
**Add Document** popup, captures the save response, and verifies the new
document.

---

## Quick Start

```bash
# 1. Install dependencies and the Chromium browser
npm install
npx playwright install chromium

# 2. (Optional) point the suite at your environment / credentials
export LMS_BASE_URL="https://www.bissafety.app/v1/index.cfm?action=home.loginForm"
export LMS_USERNAME="your-username"
export LMS_PASSWORD="your-password"
export LMS_FOLDER_NAME="Test Automation Folder"
export LMS_DOCUMENT_TITLE="DocInspection"

# 3. Run the tests (Chromium, headed by default)
npm test

# 4. Open the HTML report
npm run report
```

The first run logs in once via the `setup` project and saves the session to
`playwright/.auth/user.json`; later runs reuse it. If env vars are omitted, the
defaults in [`utils/env.ts`](utils/env.ts) are used.

---

## Project Structure

```
bisAssessment/
│
├── pages/                        # Page Object classes
│   ├── BasePage.ts               # Shared utilities (fill, assert, wait, nav)
│   ├── LoginPage.ts              # Login form interactions
│   ├── FoldersPage.ts            # Folder listing page
│   ├── AddDocumentPage.ts        # Add Document form (dynamic sections, upload)
│   ├── FolderDocumentsPage.ts    # Document list inside a folder
│   └── index.ts                  # Barrel export
│
├── fixtures/
│   ├── index.ts                                          # Custom Playwright fixtures (injects POMs)
│   └── Senior QA QC - Skill Assessment 2 - Instructions.pdf  # Sample file for upload tests
│
├── tests/
│   ├── auth.setup.ts             # One-time login → saves session to disk
│   ├── login.spec.ts             # Login page test
│   └── addDocument.spec.ts       # Main E2E test
│
├── test-data/
│   └── documentData.ts           # Form input values in one place
│
├── utils/
│   ├── env.ts                    # Environment config / constants
│   ├── logger.ts                 # Timestamped console logger
│   └── apiHelpers.ts             # Network intercept + response assertion helpers
│
├── playwright.config.ts          # Playwright project config (browsers, auth)
├── tsconfig.json                 # TypeScript config
└── package.json                  # Scripts + dependencies
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install browser binaries
npx playwright install chromium
```

The upload fixture `fixtures/Senior QA QC - Skill Assessment 2 - Instructions.pdf`
is committed. To use a different file, replace it (and update the path in
`tests/addDocument.spec.ts`).

---

## Environment Variables

All config flows through [`utils/env.ts`](utils/env.ts) (`ENV`), which reads env
vars with built-in fallbacks. Override via env vars rather than editing the file.

| Variable              | Description              | Default                                                            |
|-----------------------|--------------------------|-------------------------------------------------------------------|
| `LMS_BASE_URL`        | Login URL of the app     | `https://www.bissafety.app/v1/index.cfm?action=home.loginForm`    |
| `LMS_USERNAME`        | Login username           | (set in `env.ts`)                                                 |
| `LMS_PASSWORD`        | Login password           | (set in `env.ts`)                                                 |
| `LMS_FOLDER_NAME`     | Folder to open           | `Test Automation Folder`                                          |
| `LMS_DOCUMENT_TITLE`  | Title for the new document | `n12222`                                                        |

> Note: `env.ts` currently ships with real default credentials. Treat them as
> sensitive — prefer setting env vars over committing changes to those defaults.

Set them in your shell or a `.env` file.

---

## Running Tests

```bash
# Run all tests
npm test

# Run on Chromium only
npm run test:chrome

# Run only the login test
npm run test:login

# Run in headed mode (see the browser)
npm run test:headed

# Step-through debug mode
npm run test:debug

# Open the HTML report
npm run report

# Clean reports / results / saved auth
npm run clean
```

Run a single file or a single test by title:

```bash
npx playwright test tests/addDocument.spec.ts
npx playwright test -g "Add Document"
```

---

## Architecture Decisions

### Page Object Model
Each page/component has its own class extending `BasePage`. Locators live in the
Page Objects, not in the tests.

| Class                  | Responsibility                                              |
|------------------------|------------------------------------------------------------|
| `BasePage`             | Shared helpers: fill, check, wait, assert                  |
| `LoginPage`            | Login form                                                 |
| `FoldersPage`          | Folder listing + open a folder                             |
| `AddDocumentPage`      | Title, terms, notification alert, file upload, submit      |
| `FolderDocumentsPage`  | Click Add (+), post-submit URL + document assertions       |

### Custom Fixtures
Tests import `test`/`expect` from [`fixtures/index.ts`](fixtures/index.ts)
instead of `@playwright/test`. This injects ready-to-use Page Object instances —
no `new` calls needed in tests.

### Auth Setup
[`auth.setup.ts`](tests/auth.setup.ts) is a Playwright `setup` project that logs
in once and saves the session to `playwright/.auth/user.json`. The `chromium`
project declares `setup` as a dependency, so tests start pre-authenticated.
`addDocument.spec.ts` also re-establishes the session inline (recreating
cookies/localStorage) as a fallback.

### Add Document opens in a popup
Clicking the Add Document trigger opens a **popup window**. The test captures it
via `page.waitForEvent('popup')` and drives the form through an
`AddDocumentPage` bound to that popup page (not the main page).

### Save response capture
The app is ColdFusion, so the save is an HTML form **POST** (often a redirect),
not a JSON API call. The test registers `waitForResponse` and clicks Submit
inside a single `Promise.all` — so the listener is attached before the click —
and asserts the status is one of `200 / 201 / 302`. JSON bodies are parsed only
when the `content-type` indicates JSON.

### Test Data / Config Separation
Input values such as the document title live in `ENV` ([`utils/env.ts`](utils/env.ts))
and `test-data/documentData.ts`, so updating values for a new environment means
editing one place.
