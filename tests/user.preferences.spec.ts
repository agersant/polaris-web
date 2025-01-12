import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByTestId('sidebar').getByTestId('settings').click();
    await page.getByTestId('preferences').click();
});

const crankAccentColor = async function (page: Page) {
    const hueSlider = await page.getByTestId('accent-hue');
    await hueSlider.getByTestId('knob').hover();
    await page.mouse.down();
    await hueSlider.hover({ force: true, position: { x: 500, y: 0 } });
    await page.mouse.up();

    const saturationSlider = await page.getByTestId('accent-saturation');
    await saturationSlider.getByTestId('knob').hover();
    await page.mouse.down();
    await saturationSlider.hover({ force: true, position: { x: 500, y: 0 } });
    await page.mouse.up();
}

test("can change theme", async ({ page }) => {
    await page.getByTestId('theme').click();
    await page.getByTestId('theme').getByText('Light').last().click();
    await expect(page.getByTestId('sidebar')).toHaveCSS("background-color", "rgb(255, 255, 255)");

    await page.getByTestId('theme').click();
    await page.getByTestId('theme').getByText('Dark').last().click();
    await expect(page.getByTestId('sidebar')).toHaveCSS("background-color", "rgb(24, 24, 27)");
});

test("can change accent palette", async ({ page }) => {
    await crankAccentColor(page);
    await expect(page.getByTestId('swatch').last()).toHaveCSS("background-color", "rgb(150, 0, 0)");
});

test("theme choice persists on reload", async ({ page }) => {
    await page.getByTestId('theme').click();
    await page.getByTestId('theme').getByText('Dark').last().click();
    await expect(page.getByTestId('sidebar')).toHaveCSS("background-color", "rgb(24, 24, 27)");
    await page.reload();
    await expect(page.getByTestId('sidebar')).toHaveCSS("background-color", "rgb(24, 24, 27)");
});

test("can reset theme", async ({ page }) => {
    await page.getByTestId('theme').click();
    await page.getByTestId('theme').getByText('Dark').last().click();
    await crankAccentColor(page);

    await page.getByTestId('reset-color-scheme').click();
    await expect(page.getByTestId('sidebar')).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.getByTestId('swatch').last()).toHaveCSS("background-color", "rgb(10, 74, 137)");
});
