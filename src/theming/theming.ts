import Blue from "./themes/blue";
import Brown from "./themes/brown";
import Dark from "./themes/dark";
import Light from "./themes/light";

export type ThemeData = {
	name: string;
	foreground: string;
	foregroundMuted: string;
	foregroundAgainstAccent: string;
	background: string;
	backgroundMuted: string;
	border: string;
	borderMuted: string;
	menuForeground: string;
	menuBackground: string;
	good: string;
	bad: string;
	foregroundAgainstGood: string;
	foregroundAgainstBad: string;
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

export function applyTheme(theme: Theme, accent: string) {
	document.documentElement.style.setProperty("--theme-accent", accent);
	let themeData = themes.get(theme);
	if (themeData) {
		document.documentElement.style.setProperty("--theme-foreground", themeData.foreground);
		document.documentElement.style.setProperty("--theme-foreground-muted", themeData.foregroundMuted);
		document.documentElement.style.setProperty("--theme-foreground-against-accent", themeData.foregroundAgainstAccent);
		document.documentElement.style.setProperty("--theme-background", themeData.background);
		document.documentElement.style.setProperty("--theme-background-muted", themeData.backgroundMuted);
		document.documentElement.style.setProperty("--theme-border", themeData.border);
		document.documentElement.style.setProperty("--theme-border-muted", themeData.borderMuted);
		document.documentElement.style.setProperty("--theme-menu-foreground", themeData.menuForeground);
		document.documentElement.style.setProperty("--theme-menu-background", themeData.menuBackground);
		document.documentElement.style.setProperty("--theme-good", themeData.good);
		document.documentElement.style.setProperty("--theme-bad", themeData.bad);
		document.documentElement.style.setProperty("--theme-foreground-against-good", themeData.foregroundAgainstGood);
		document.documentElement.style.setProperty("--theme-foreground-against-bad", themeData.foregroundAgainstBad);
	}
}
