import Blue from "./themes/blue";
import Brown from "./themes/brown";
import Dark from "./themes/dark";
import Light from "./themes/light";

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

export function getDefaultTheme(): Theme {
	return Theme.LIGHT;
}

export function getDefaultAccent(): string {
	return "#44C8F1";
}

function toRGB(hex: string) {
	var parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!parsed) {
		return "0 0 0";
	}
	return `${parseInt(parsed[1], 16)} ${parseInt(parsed[2], 16)} ${parseInt(parsed[3], 16)}`;
}

export function applyTheme(theme: Theme, accent: string) {
	let themeData = themes.get(theme);
	if (!themeData) {
		return;
	}

	document.documentElement.setAttribute("data-polaris-theme-polarity", themeData.polarity);

	const style = document.documentElement.style;
	style.setProperty("--surface-0", toRGB(themeData["surface-0"]));
	style.setProperty("--surface-50", toRGB(themeData["surface-50"]));
	style.setProperty("--surface-100", toRGB(themeData["surface-100"]));
	style.setProperty("--surface-200", toRGB(themeData["surface-200"]));
	style.setProperty("--surface-300", toRGB(themeData["surface-300"]));
	style.setProperty("--surface-400", toRGB(themeData["surface-400"]));
	style.setProperty("--surface-500", toRGB(themeData["surface-500"]));
	style.setProperty("--surface-600", toRGB(themeData["surface-600"]));
	style.setProperty("--surface-700", toRGB(themeData["surface-700"]));
	style.setProperty("--surface-800", toRGB(themeData["surface-800"]));
	style.setProperty("--surface-900", toRGB(themeData["surface-900"]));
	style.setProperty("--surface-950", toRGB(themeData["surface-950"]));
}
