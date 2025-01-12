import { test, expect } from '@playwright/test';

test("can set album art pattern", async ({ page }) => {
    const pattern = Math.random().toString();
    const putRequest = page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/settings"));

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();
    await page.getByLabel('album art pattern').fill(pattern);
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();
    await expect(page.getByLabel('album art pattern')).toHaveValue(pattern);
});

test("can add and remove mount dir", async ({ page }) => {
    const location = Math.random().toString();
    const name = Math.random().toString();
    const waitForPut = () => page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/mount_dirs"));

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();

    await page.getByTestId('add-source').click();
    await page.getByTestId('location').getByRole('textbox').last().fill(location);
    await page.getByTestId('name').getByRole('textbox').last().fill(name);

    var putRequest = waitForPut();
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByTestId('location')).toHaveCount(2);
    await expect(page.getByTestId('location').getByRole('textbox').last()).toHaveValue(location);
    await expect(page.getByTestId('name').getByRole('textbox').last()).toHaveValue(name);

    await page.getByTestId('delete-source').last().click();

    var putRequest = waitForPut();
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByTestId('location')).toHaveCount(1);
});

test("can add and remove user", async ({ page }) => {

    const username = Math.random().toString();
    const password = Math.random().toString();

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('users').click();

    await page.getByTestId('add-user').click();
    await page.getByLabel('username').fill(username);
    await page.getByLabel('password').fill(password);

    const postRequest = page.waitForRequest(request => request.method() == "POST" && request.url().endsWith('/api/user'));
    await page.getByTestId('create-user').click();
    await postRequest;
    await page.reload();

    await expect(page.getByTestId('user')).toHaveCount(2);
    await expect(page.getByTestId('user').last()).toContainText(username);

    const deleteRequest = page.waitForRequest(request => request.method() == "DELETE" && request.url().endsWith(`/api/user/${username}`));
    await page.getByTestId('delete-user').last().click();
    await deleteRequest;
    await page.reload();

    await expect(page.getByTestId('user')).toHaveCount(1);
});

test("can change ddns update URL", async ({ page }) => {
    const url = `http://example.com/${Math.random().toString()}`;

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('ddns').click();

    await page.getByLabel('update url').fill(url);

    const putRequest = page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/settings"));
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByLabel('update url')).toHaveValue(url);
});

test("can trigger reindex", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();
    await page.getByTestId('trigger-scan').click();
    await expect(page.getByTestId('last-scan')).toContainText('just now', { timeout: 10_000 });
});
