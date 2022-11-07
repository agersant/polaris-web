import Blue from "./theme-bases/blue";
import Brown from "./theme-bases/brown";
import Dark from "./theme-bases/dark";
import Light from "./theme-bases/light";

export type ThemeBase = {
	id: string;
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

let bases: Map<string, ThemeBase> = new Map();
let defaultBaseID: string;

registerBase(Light);
registerBase(Dark);
registerBase(Blue);
registerBase(Brown);

function registerBase(themeBase: ThemeBase) {
	bases.set(themeBase.id, themeBase);
	if (!defaultBaseID) {
		defaultBaseID = themeBase.id;
	}
}

export function listBases() {
	let result = Array.from(bases, ([id, content]) => {
		return { id: id, name: content.name };
	});
	result.sort(function (a, b) {
		return a.name > b.name ? 1 : -1;
	});
	return result;
}

export function getDefaultBaseID(): string {
	return defaultBaseID;
}

export function getDefaultAccent(): string {
	return "#44C8F1";
}

export function applyTheme(baseName: string, accent: string) {
	document.documentElement.style.setProperty("--theme-accent", accent);
	let base = bases.get(baseName);
	if (base) {
		document.documentElement.style.setProperty("--theme-foreground", base.foreground);
		document.documentElement.style.setProperty("--theme-foreground-muted", base.foregroundMuted);
		document.documentElement.style.setProperty("--theme-foreground-against-accent", base.foregroundAgainstAccent);
		document.documentElement.style.setProperty("--theme-background", base.background);
		document.documentElement.style.setProperty("--theme-background-muted", base.backgroundMuted);
		document.documentElement.style.setProperty("--theme-border", base.border);
		document.documentElement.style.setProperty("--theme-border-muted", base.borderMuted);
		document.documentElement.style.setProperty("--theme-menu-foreground", base.menuForeground);
		document.documentElement.style.setProperty("--theme-menu-background", base.menuBackground);
		document.documentElement.style.setProperty("--theme-good", base.good);
		document.documentElement.style.setProperty("--theme-bad", base.bad);
		document.documentElement.style.setProperty("--theme-foreground-against-good", base.foregroundAgainstGood);
		document.documentElement.style.setProperty("--theme-foreground-against-bad", base.foregroundAgainstBad);
	}
}
