import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test("rejects bad passwords", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('badPassword');
    await page.getByTestId('submit-login').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
});

test("can login", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('testPassword');
    await page.getByTestId('submit-login').click();
    await page.waitForURL('**/files');
});

test("remembers login between visits", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('testPassword');
    await page.getByTestId('submit-login').click();
    await page.waitForURL('**/files');
    await page.goto("/");
    await page.waitForURL('**/files');
});

test("asks for credentials after logging out", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('testPassword');
    await page.getByTestId('submit-login').click();

    await page.getByTestId('logout').click();
    await page.waitForURL('**/auth');

    await expect(page.getByTestId('username')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('submit-login')).toBeVisible();
});

test("asks for credentials again when returning after logging out", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('testPassword');
    await page.getByTestId('submit-login').click();

    await page.getByTestId('logout').click();

    await page.goto("/");
    await page.waitForURL('**/auth');
    await expect(page.getByTestId('username')).toBeVisible();
    await expect(page.getByTestId('password')).toBeVisible();
    await expect(page.getByTestId('submit-login')).toBeVisible();
});

test("starts on auth page when returning with bad auth token", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('username').fill('testUser');
    await page.getByTestId('password').fill('testPassword');
    await page.getByTestId('submit-login').click();
});

test.describe('with bad auth token', async () => {
    test.use({
        storageState: {
            cookies: [],
            origins: [{
                origin: 'http://localhost:5050',
                localStorage: [{ name: 'authToken', value: 'badToken' }]
            }]
        }
    });

    test("starts on auth page", async ({ page }) => {
        await page.goto("/");
        await page.waitForURL('**/auth');
    });
});
