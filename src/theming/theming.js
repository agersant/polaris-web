import Blue from "./theme-bases/blue"
import Brown from "./theme-bases/brown"
import Dark from "./theme-bases/dark"
import Light from "./theme-bases/light"

var bases = new Map();
var defaultBase;
var currentBase;
var defaulAccentColor = "#44C8F1";
var currentAccentColor;

registerBase(Light);
registerBase(Dark);
registerBase(Blue);
registerBase(Brown);

export function registerBase(content) {
	bases.set(content.id, content);
	if (!defaultBase) {
		defaultBase = content.id;
		setBase(null);
		setAccentColor(null);
	}
}

export function listBases() {
	var result = Array.from(bases, ([id, content]) => {
		return { id: id, name: content.name, }
	});
	result.sort(function(a, b) { return a.name > b.name ? 1 : -1; });
	return result;
}

export function setBase(id) {
	var entry = bases.get(id);
	if (!bases.get(id)) {
		id = defaultBase;
	}
	entry = bases.get(id);
	currentBase = id;

	const baseNode = document.querySelector("div.theme-base");
	baseNode.style.cssText = null;
	Object.entries(entry.colors).forEach(([key, value]) => {
		baseNode.style.setProperty(key, value);
	});
}

export function setAccentColor(color) {
	if (!color) {
		color = defaulAccentColor;
	}
	currentAccentColor = color;
	const accentNode = document.querySelector("div.theme-accent");
	accentNode.style.setProperty("--theme-accent", color);
}

export function getCurrentBase() {
	return currentBase;
}

export function getCurrentAccentColor() {
	return currentAccentColor;
}
