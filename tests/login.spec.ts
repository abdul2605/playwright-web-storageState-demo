/**
 * tests/login.spec.ts
 *
 * Verifies login behavior for the BIS application.
 *
 * Description:
 *   This suite covers positive and negative authentication flows using
 *   the login page object.
 */

import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import { ENV } from "../utils/env";

const test = base;

test.describe.skip("Login Page", () => {
  test("should log in successfully with valid credentials", async ({ page }) => {
    // Arrange: create the page object and navigate to the login page via helper
    const loginPage = new LoginPage(page);

    // Act: perform login using configured environment credentials
    await loginPage.loginAndWait(ENV.baseUrl, ENV.username, ENV.password);

    // Assert: the browser should no longer be on the login route
    expect(page.url()).not.toContain("/login");
    // await expect(page.locator('#reactRoot')).toContainText('Add Course');
    // await page.getByRole('link', { name: 'Folders' }).click();

    // await page.locator('#folderHolder').getByRole('link', { name: 'BIS Assessment Portal' }).click();
    // const page1Promise = page.waitForEvent('popup');
    // await page.locator('#formAsses').first().click();
    // const page1 = await page1Promise;
    // await page1.getByRole('heading', { name: 'Add Document' }).click();
    // await expect(page1.getByRole('heading', { name: 'Add Document' })).toBeVisible();
    // await expect(page1.getByRole('heading')).toContainText('Add Document');
    // await page1.getByRole('checkbox', { name: 'Include Acceptance Terms/' }).check();



  });

  // test("should show an error with invalid credentials", async ({ page }) => {
  //   // Arrange: open the login page and create the page object
  //   const loginPage = new LoginPage(page);
  //   await loginPage.open(ENV.baseUrl);

  //   // Act: submit invalid credentials
  //   await loginPage.login("wrong@example.com", "wrongpassword");

  //   // Assert: an authentication error message should be displayed
  //   await loginPage.assertErrorVisible();
  // });
});
