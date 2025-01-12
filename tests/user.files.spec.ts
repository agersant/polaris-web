import { test, expect } from '@playwright/test';

test("can expand directories", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).getByTestId('toggle').click();
    await page.getByTestId('node').filter({ hasText: 'Hunted' }).click({ clickCount: 2 });
    await expect(page.getByText('Three Gates')).toBeVisible();
});

test("can filter content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText('Tobokegao')).toBeVisible();
    await page.getByTestId('filter').fill('Hunted');
    await expect(page.getByText('Tobokegao')).not.toBeVisible();
});

test("can double click to queue a song", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('clear-playlist').click({ force: true });
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).getByTestId('toggle').click();
    await page.getByTestId('node').filter({ hasText: 'Hunted' }).getByTestId('toggle').click();
    await page.getByText('Three Gates').click({ clickCount: 2 });
    await expect(page.getByTestId('playlist-song')).toHaveCount(1);
});

test("can drag and drop a song to playlist", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('clear-playlist').click({ force: true });
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).getByTestId('toggle').click();
    await page.getByTestId('node').filter({ hasText: 'Hunted' }).getByTestId('toggle').click();
    await page.getByText('Three Gates').dragTo(page.getByTestId('playlist-songs'));
    await expect(page.getByTestId('playlist-song')).toHaveCount(1);
});

test("can drag and drop a directory to playlist", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('clear-playlist').click({ force: true });
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).dragTo(page.getByTestId('playlist-songs'));
    await expect(page.getByTestId('playlist-song')).toHaveCount(5);
});

test("can drag and drop multiple directories to playlist at once", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('clear-playlist').click({ force: true });
    await page.getByTestId('node').filter({ hasText: 'Khemmis' }).click();
    await page.getByTestId('node').filter({ hasText: 'Tobokegao' }).click({ modifiers: ['Control'] });
    await page.getByTestId('node').filter({ hasText: 'Tobokegao' }).dragTo(page.getByTestId('playlist-songs'));
    await expect(page.getByTestId('playlist-song')).toHaveCount(13);
});

