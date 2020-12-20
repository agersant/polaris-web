import Blue from "./theme-bases/blue"
import Brown from "./theme-bases/brown"
import Dark from "./theme-bases/dark"
import Light from "./theme-bases/light"

let bases = new Map();
let defaultBase;

registerBase(Light);
registerBase(Dark);
registerBase(Blue);
registerBase(Brown);

export function registerBase(content) {
	bases.set(content.id, content);
	if (!defaultBase) {
		defaultBase = content.id;
	}
}

export function listBases() {
	let result = Array.from(bases, ([id, content]) => {
		return { id: id, name: content.name, }
	});
	result.sort(function(a, b) { return a.name > b.name ? 1 : -1; });
	return result;
}

export function getDefaultBase() {
	return defaultBase;
}

export function getDefaultAccent() {
	return "#44C8F1";
}

export function getThemeColors(baseName, accent) {
	let style = {};

	style["--theme-accent"] = accent;

	let base = bases.get(baseName);
	Object.entries(base.colors).forEach(([key, value]) => {
		style[key] = value;
	});

	return style;
}
