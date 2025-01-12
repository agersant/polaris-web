import { test, expect } from '@playwright/test';

test("Can save, retrieve, delete playlist", async ({ page }) => {
    const names = [
        `My Playlist ${Math.random().toString()}`,
        '???',
    ];
    for (const name of names) {
        await page.goto("/");
        await page.getByTestId('sidebar').getByTestId('albums').click();
        await page.getByTestId('album').filter({ hasText: 'Hunted' }).getByTestId('album-art').click({ force: true, timeout: 500 });
        await page.getByTestId('play-all').click();
        await page.getByTestId('save-playlist').click();
        await page.getByTestId('save-playlist-name').fill(name);
        await page.getByTestId('submit-save-playlist').click();

        await page.getByTestId('sidebar').getByTestId('playlists').click();
        await page.getByTestId('saved-playlist').getByText(name).click();
        await expect(page.getByTestId('saved-playlist-songs').getByTestId('song').locator('visible=true')).toHaveCount(5);
        await page.getByTestId('delete-playlist').click();

        await page.getByTestId('sidebar').getByTestId('playlists').click();
        await expect(page.getByTestId('saved-playlist').getByText(name)).toHaveCount(0);
    }
});
