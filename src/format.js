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

export function longDuration(totalSeconds) {
	if (isNaN(totalSeconds)) {
		return "";
	}
	let hours = Math.floor(totalSeconds / 3600);
	let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
	let seconds = totalSeconds - (hours * 3600) - (minutes * 60);
	let output = "";
	if (hours > 0) { output += hours + "h "; }
	if (hours > 0 || minutes > 0) { output += minutes + "m "; }
	output += seconds + "s";
	return output;
}

export function title(track) {
	return track.title || stripFileExtension(getPathTail(track.path));
}
