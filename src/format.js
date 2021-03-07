export function getPathTail(path) {
	if (!path) {
		return null;
	}
	path = path.replace(/\\/g, "/");
	let slices = path.split("/");
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

export function longDuration(totalSeconds) {
	if (isNaN(totalSeconds)) {
		return "";
	}
	let seconds = totalSeconds;
	let days = Math.floor(seconds / 3600 / 24);
	seconds -= days * 3600 * 24;
	let hours = Math.floor(seconds / 3600);
	seconds -= hours * 3600;
	let minutes = Math.floor(seconds / 60);
	seconds -= minutes * 60;
	let output = "";
	if (totalSeconds >= 3600 * 24) { output += days + "d "; }
	if (totalSeconds >= 3600) { output += hours + "h "; }
	if (totalSeconds >= 60) { output += minutes + "m "; }
	output += seconds + "s";
	return output;
}

export function title(track) {
	return track.title || stripFileExtension(getPathTail(track.path));
}
