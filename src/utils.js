// TODO rename this to formatting and potentially move track formatting functions here

export function getPathTail(path) {
	if (!path) {
		return null;
	}
	path = path.replace(/\\/g, "/");
	var slices = path.split("/");
	slices = slices.filter(s => s.length > 0);
	return slices[slices.length - 1] || "";
}

export function stripFileExtension(path) {
	if (!path) {
		return null;
	}
	return path.replace(/\.[^/.]+$/, "");
}