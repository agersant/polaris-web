import { test, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test.describe('initial setup tests', () => {

    test('click through initial setup flow', async ({ page }) => {
        await page.goto("/");

        await expect(page.getByText("Welcome to Polaris!")).toBeVisible();
        await page.getByTestId('submit-welcome').click();

        await expect(page.getByText("Music Sources")).toBeVisible();
        await expect(page.getByTestId("submit-mount-dirs")).toBeDisabled();
        await page.getByTestId('location').fill("test-data/small-collection");
        await page.getByTestId('name').fill("Test");
        await page.getByTestId('submit-mount-dirs').click();

        await expect(page.getByText("User Account")).toBeVisible();
        await expect(page.getByTestId("submit-user")).toBeDisabled();
        await page.getByTestId('create-username').fill("testUser");
        await page.getByTestId('create-password').fill("testPassword");
        await page.getByTestId('create-password-confirm').fill("testPassword");
        await page.getByTestId('submit-user').click();

        await page.waitForURL('**/files');

        await page.context().storageState({ path: authFile });
    });
});
