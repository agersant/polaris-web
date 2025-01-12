import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('albums').click();
    await page.getByTestId('album').filter({ hasText: 'Picnic', hasNotText: 'Remixes' }).getByTestId('album-art').click({ force: true });
    await page.getByTestId('play-all').click();
    await expect(page.getByTestId('playlist-song')).toHaveCount(7);
});

test("Can clear playlist", async ({ page }) => {
    await page.getByTestId('clear-playlist').click();
    await expect(page.getByTestId('playlist-song')).toHaveCount(0);
});

test("Can remove playlist songs", async ({ page }) => {
    await page.getByTestId('playlist-song').getByText('Blueberry').click();
    await page.getByTestId('playlist-song').getByText('Sherbet').click({ modifiers: ["Shift"] });
    await page.getByTestId('playlist-song').getByText('Sherbet').press('Delete');
    await expect(page.getByTestId('playlist-song')).toHaveCount(4);
});

test("Can jump to a track", async ({ page }) => {
    await page.getByTestId('playlist-song').getByText('Why').click({ clickCount: 2 });
    await expect(page.getByTestId('player')).toContainText('Why');
});

test("Can open playlist stats", async ({ page }) => {
    await page.getByTestId('show-playlist-stats').click();
    await expect(page.getByTestId('song-count')).toHaveText('7');
});
