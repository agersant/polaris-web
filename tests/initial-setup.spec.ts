import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test.describe('initial setup tests', () => {

    test('can click through initial setup flow', async ({ page }) => {
        await page.goto("/");

        await expect(page.getByText("Welcome to Polaris!")).toBeVisible();
        await page.getByTestId('submit-welcome').click();

        await expect(page.getByText("Music Sources")).toBeVisible();
        await expect(page.getByTestId("submit-mount-dirs")).toBeDisabled();
        await page.getByLabel('location').fill("test-data/small-collection");
        await page.getByLabel('name').fill("Test");
        await page.getByTestId('submit-mount-dirs').click();

        await expect(page.getByText("User Account")).toBeVisible();
        await expect(page.getByTestId("submit-user")).toBeDisabled();
        await page.getByLabel('username').fill("testUser");
        await page.getByLabel('password').first().fill("testPassword");
        await page.getByLabel('confirm password').fill("testPassword");
        await page.getByTestId('submit-user').click();

        await page.waitForURL('**/files');

        await page.context().storageState({ path: authFile });
    });
});
