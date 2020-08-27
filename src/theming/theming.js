import Blue from "./theme-bases/blue"
import Brown from "./theme-bases/brown"
import Dark from "./theme-bases/dark"
import Light from "./theme-bases/light"

let bases = new Map();
let defaultBase;
let currentBase;
const defaultAccentColor = "#44C8F1";
let currentAccentColor;

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
	let result = Array.from(bases, ([id, content]) => {
		return { id: id, name: content.name, }
	});
	result.sort(function(a, b) { return a.name > b.name ? 1 : -1; });
	return result;
}

export function setBase(id) {
	if (!bases.get(id)) {
		id = defaultBase;
	}
	const entry = bases.get(id);
	currentBase = id;

	const baseNode = document.querySelector("div.theme-base");
	baseNode.style.cssText = null;
	Object.entries(entry.colors).forEach(([key, value]) => {
		baseNode.style.setProperty(key, value);
	});
}

export function setAccentColor(color) {
	if (!color) {
		color = defaultAccentColor;
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
