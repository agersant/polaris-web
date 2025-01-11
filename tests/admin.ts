import { test, expect } from '@playwright/test';

test("set album art pattern", async ({ page }) => {
    const pattern = Math.random().toString();
    const putRequest = page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/settings"));

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();
    await page.getByTestId('album-art-pattern').fill(pattern);
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();
    await expect(page.getByTestId('album-art-pattern')).toHaveValue(pattern);
});

test("add and remove mount dir", async ({ page }) => {
    const source = Math.random().toString();
    const name = Math.random().toString();
    const waitForPut = () => page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/mount_dirs"))

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();

    await page.getByTestId('add-source').click();
    await page.getByTestId('source').last().fill(source);
    await page.getByTestId('name').last().fill(name);

    var putRequest = waitForPut();
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByTestId('source')).toHaveCount(2);
    await expect(page.getByTestId('source').last()).toHaveValue(source);
    await expect(page.getByTestId('name').last()).toHaveValue(name);

    await page.getByTestId('delete-source').last().click();

    var putRequest = waitForPut();
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByTestId('source')).toHaveCount(1);
});

test("change ddns update URL", async ({ page }) => {
    const url = `http://example.com/${Math.random().toString()}`;

    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('ddns').click();

    await page.getByTestId('ddns-url').fill(url);
    console.log(url);

    const putRequest = page.waitForRequest(request => request.method() == "PUT" && request.url().endsWith("/api/settings"));
    await page.getByTestId('apply').click();
    await putRequest;
    await page.reload();

    await expect(page.getByTestId('ddns-url')).toHaveValue(url);
});

test("reindex", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('collection').click();
    await page.getByTestId('trigger-scan').click();
    await expect(page.getByTestId('last-scan')).toContainText('just now', { timeout: 10_000 });
});
