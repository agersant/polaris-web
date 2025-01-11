import { test, expect } from '@playwright/test';

test("can see albums", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('albums').click();
    await expect(page.getByTestId('album')).toHaveCount(3);
});
