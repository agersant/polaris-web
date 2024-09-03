import { useMode, modeRgb, modeOklch, Oklch, Rgb, toGamut } from "culori/fn";

import Blue from "./themes/blue";
import Brown from "./themes/brown";
import Dark from "./themes/dark";
import Light from "./themes/light";

const rgb = useMode(modeRgb);
const oklch = useMode(modeOklch);

export type ThemeData = {
	name: string;
	polarity: "light" | "dark",
	"surface-0": string;
	"surface-50": string;
	"surface-100": string;
	"surface-200": string;
	"surface-300": string;
	"surface-400": string;
	"surface-500": string;
	"surface-600": string;
	"surface-700": string;
	"surface-800": string;
	"surface-900": string;
	"surface-950": string;
};

export enum Theme {
	BLUE = "blue",
	BROWN = "brown",
	DARK = "dark",
	LIGHT = "light",
}

const themes: Map<Theme, ThemeData> = new Map([
	[Theme.BLUE, Blue],
	[Theme.BROWN, Brown],
	[Theme.DARK, Dark],
	[Theme.LIGHT, Light],
]);

export function getThemeName(theme: Theme): string {
	const themeData = themes.get(theme)!;
	return themeData.name;
}

export function getThemePolarity(theme: Theme): "light" | "dark" {
	const themeData = themes.get(theme)!;
	return themeData.polarity;
}

export function getDefaultTheme(): Theme {
	return Theme.LIGHT;
}

export function getDefaultAccent(): string {
	return "#44C8F1";
}

function clamp(value: number, min?: number, max?: number) {
	min = min || 0;
	max = (max == undefined) ? 1 : max;
	return Math.max(min, Math.min(value, max));
}

function rgbToString(rgb: Rgb) {
	const scale = (value: number) => Math.round(clamp(value) * 255);
	return `${scale(rgb.r)} ${scale(rgb.g)} ${scale(rgb.b)} `;
}

function hexToRGBString(hex: string) {
	const colorRGB = rgb(hex);
	if (!colorRGB) {
		return "0 0 0";
	}
	return rgbToString(colorRGB);
}

function computeAccentRamp(accent: Oklch): Rgb[] {

	const referenceRamp = [
		"#f6f9fe",
		"#ecf5fe",
		"#d4ebfc",
		"#b3e0f9",
		"#88d5f6",
		"#46c8f1",
		"#25b2ee",
		"#1196e4",
		"#0f75c2",
		"#0a4a89",
		"#041934"
	];

	const ramp = [];

	for (let i = 0; i < 11; i++) {
		const referenceShade = oklch(referenceRamp[i]);
		const referenceStop = oklch(referenceRamp[5]);

		if (!referenceShade || !referenceStop) {
			return [];
		}

		const hueShift = (referenceShade.h || 0) - (referenceStop.h || 0);
		const shade: Oklch = {
			mode: "oklch",
			l: clamp(referenceShade.l),
			c: clamp(referenceShade.c), // TODO allow users to add/subtract from this
			h: ((accent?.h || 0) + hueShift) % 360,
		};

		const shadeRGB = toGamut("rgb", "oklch")(shade);
		if (shadeRGB) {
			ramp.push(shadeRGB);
		}
	}

	return ramp;
}

export function applyTheme(theme: Theme, accent: string) {
	let themeData = themes.get(theme);
	if (!themeData) {
		return;
	}

	document.documentElement.setAttribute("data-polaris-theme-polarity", themeData.polarity);

	const style = document.documentElement.style;
	style.setProperty("--surface-0", "255 255 255");
	style.setProperty("--surface-50", hexToRGBString(themeData["surface-50"]));
	style.setProperty("--surface-100", hexToRGBString(themeData["surface-100"]));
	style.setProperty("--surface-200", hexToRGBString(themeData["surface-200"]));
	style.setProperty("--surface-300", hexToRGBString(themeData["surface-300"]));
	style.setProperty("--surface-400", hexToRGBString(themeData["surface-400"]));
	style.setProperty("--surface-500", hexToRGBString(themeData["surface-500"]));
	style.setProperty("--surface-600", hexToRGBString(themeData["surface-600"]));
	style.setProperty("--surface-700", hexToRGBString(themeData["surface-700"]));
	style.setProperty("--surface-800", hexToRGBString(themeData["surface-800"]));
	style.setProperty("--surface-900", hexToRGBString(themeData["surface-900"]));
	style.setProperty("--surface-950", hexToRGBString(themeData["surface-950"]));

	const accentRamp = computeAccentRamp(oklch(accent) || { mode: "oklch", c: 0, l: 0 });
	style.setProperty("--accent-0", "255 255 255");
	style.setProperty("--accent-50", rgbToString(accentRamp[0]));
	style.setProperty("--accent-100", rgbToString(accentRamp[1]));
	style.setProperty("--accent-200", rgbToString(accentRamp[2]));
	style.setProperty("--accent-300", rgbToString(accentRamp[3]));
	style.setProperty("--accent-400", rgbToString(accentRamp[4]));
	style.setProperty("--accent-500", rgbToString(accentRamp[5]));
	style.setProperty("--accent-600", rgbToString(accentRamp[6]));
	style.setProperty("--accent-700", rgbToString(accentRamp[7]));
	style.setProperty("--accent-800", rgbToString(accentRamp[8]));
	style.setProperty("--accent-900", rgbToString(accentRamp[9]));
	style.setProperty("--accent-950", rgbToString(accentRamp[10]));
}
