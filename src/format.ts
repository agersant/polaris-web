import { Song } from "@/api/dto";

export function isFakeArtist(name: string) {
	return name == "Various Artists" || name == "VA";
}

export function getPathTail(path: string) {
	path = path.replace(/\\/g, "/");
	let slices = path.split("/");
	slices = slices.filter(s => s.length > 0);
	return slices[slices.length - 1] || "";
}

export function stripFileExtension(path: string | null): string | null {
	if (!path) {
		return null;
	}
	return path.replace(/\.[^/.]+$/, "");
}

export function formatDuration(seconds: number): string {
	if (isNaN(seconds)) {
		return "";
	}
	let date = new Date(0);
	date.setSeconds(seconds);
	let formatted = date.toISOString().substring(11, 19);
	formatted = formatted.replace(/^[0:]{1,4}/, "");
	return formatted;
}

export function formatLongDuration(totalSeconds: number): string {
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
	if (totalSeconds >= 3600 * 24) {
		output += days + "d ";
	}
	if (totalSeconds >= 3600) {
		output += hours + "h ";
	}
	if (totalSeconds >= 60) {
		output += minutes + "m ";
	}
	output += seconds + "s";
	return output;
}

export function formatArtists(artists: string[]) {
	return artists.join(", ");
}

export function formatTrackNumber(song: Song): string {
	if (song.track_number == undefined) {
		return "";
	}
	const trackNumber = (song.track_number < 10) ? `0${song.track_number}` : song.track_number.toString();
	if (song.disc_number == undefined) {
		return trackNumber;
	} else {
		return `${song.disc_number}.${trackNumber}`;
	}
}

export function formatTitle(song: Song) {
	return song.title || stripFileExtension(getPathTail(song.path));
}

export function formatSong(song: Song) {
	let artists: string[] = [];
	if (song.artists?.length) {
		artists = song.artists;
	} else if (song.album_artists?.length) {
		artists = song.album_artists;
	}

	const artistText = artists.length ? formatArtists(artists) : "Unknown Artist";
	const titleText = formatTitle(song);
	return `${artistText} - ${titleText}`;
}

export function pluralize(word: string, n: number) {
	if (n > 1) {
		return `${word}s`;
	} else {
		return word;
	}
} 
