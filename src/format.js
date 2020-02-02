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

export function duration(seconds) {
	if (isNaN(seconds)) {
		return "";
	}
	let date = new Date(null);
	date.setSeconds(seconds);
	let formatted = date.toISOString().substr(11, 8);
	formatted = formatted.replace(/^[0:]{1,4}/, "");
	return formatted;
}

export function title(track) {
	return track.title || stripFileExtension(getPathTail(track.path));
}
