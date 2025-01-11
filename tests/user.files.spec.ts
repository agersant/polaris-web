import { test, expect } from '@playwright/test';

test("can expand directories", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).getByTestId('toggle').click();
    await page.getByTestId('node').filter({ hasText: 'Hunted' }).getByTestId('toggle').click();
    await expect(page.getByText('Three Gates')).toBeVisible();
});

test("can filter content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText('Tobokegao')).toBeVisible();
    await page.getByTestId('filter').fill('Hunted');
    await expect(page.getByText('Tobokegao')).not.toBeVisible();
});
