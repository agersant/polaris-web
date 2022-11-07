import { markRaw, toRaw } from "vue";
import { flatten, getPlaylist } from "@/api/endpoints";
import { save, load } from "@/disk";
import { defineStore, acceptHMRUpdate } from "pinia";
import { Song } from "@/api/dto";

export type PlaylistState = {
	name: string;
	songs: Song[];
	currentTrack: Song | null;
	playbackOrder: string; // TODO should be an enum, not nullable
	elapsedSeconds: number;
};

function enqueue(state: PlaylistState, tracks: Song[]) {
	state.songs = markRaw(state.songs.concat(tracks));
	if (!state.currentTrack && state.songs.length > 0) {
		state.currentTrack = state.songs[0];
	}
}

function advance(state: PlaylistState, delta: number): Song | null {
	const playbackOrder = state.playbackOrder;
	const tracks = state.songs;
	const numTracks = tracks.length;
	const currentTrack = state.currentTrack;

	let newTrack = null;
	if (numTracks > 0) {
		if (playbackOrder == "random") {
			const newTrackIndex = Math.floor(Math.random() * numTracks);
			newTrack = tracks[newTrackIndex];
		} else if (playbackOrder == "repeat-track") {
			newTrack = currentTrack;
		} else {
			const rawCurrentTrack = toRaw(currentTrack);
			let currentTrackIndex = -1;
			if (rawCurrentTrack) {
				currentTrackIndex = tracks.indexOf(rawCurrentTrack);
			}

			if (currentTrackIndex < 0) {
				newTrack = tracks[0];
			} else {
				const newTrackIndex = currentTrackIndex + delta;
				if (newTrackIndex >= 0 && newTrackIndex < numTracks) {
					newTrack = tracks[newTrackIndex];
				} else if (playbackOrder == "repeat-all") {
					if (delta > 0) {
						newTrack = tracks[0];
					} else {
						newTrack = tracks[numTracks - 1];
					}
				}
			}
		}
	}

	if (newTrack != null) {
		state.currentTrack = newTrack;
		state.elapsedSeconds = 0;
	}

	return newTrack;
}

export const usePlaylistStore = defineStore("playlist", {
	state: (): PlaylistState => ({
		name: "",
		songs: markRaw([]),
		currentTrack: null,
		playbackOrder: "default",
		elapsedSeconds: 0,
	}),
	actions: {
		clear() {
			this.songs = markRaw([]);
			this.name = "";
			this.savePlaylist();
		},

		removeTrack(track: Song) {
			const trackIndex = this.songs.indexOf(track);
			if (trackIndex >= 0) {
				let newSongs = [...this.songs];
				newSongs.splice(trackIndex, 1);
				this.songs = markRaw(newSongs);
			}
			this.savePlaylist();
		},

		shuffle() {
			let shuffled = [...this.songs];
			for (let i = shuffled.length - 1; i > 0; i--) {
				let j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			this.songs = markRaw(shuffled);
			this.savePlaylist();
		},

		setPlaybackOrder(order: string) {
			this.playbackOrder = order;
			this.savePlaybackState();
		},

		setName(name: string) {
			this.name = name;
			this.savePlaylist();
		},

		setElapsedSeconds(seconds: number) {
			this.elapsedSeconds = seconds;
			this.savePlaybackState();
		},

		play(track: Song) {
			if (track != this.currentTrack) {
				this.currentTrack = track;
				this.elapsedSeconds = 0;
			}
			this.savePlaybackState();
		},

		next(): Song | null {
			const advancedTo = advance(this, 1);
			this.savePlaybackState();
			return advancedTo;
		},

		previous(): Song | null {
			const advancedTo = advance(this, -1);
			this.savePlaybackState();
			return advancedTo;
		},

		queueTracks(tracks: Song[]) {
			enqueue(this, tracks);
			this.savePlaylist();
		},

		async queueDirectory(path: string) {
			const tracks = await flatten(path);
			enqueue(this, tracks);
			this.savePlaylist();
		},

		async queuePlaylist(name: string) {
			const songs: Song[] = await getPlaylist(name);
			this.songs = markRaw(songs);
			this.name = name;
			this.savePlaylist();
		},

		savePlaylist() {
			if (save("playlist", this.songs)) {
				save("playlistName", this.name);
				this.savePlaybackState();
			}
		},

		savePlaybackState() {
			const rawCurrentTrack = toRaw(this.currentTrack);
			let currentTrackIndex = -1;
			if (rawCurrentTrack) {
				currentTrackIndex = this.songs.indexOf(rawCurrentTrack);
			}

			save("currentTrackIndex", currentTrackIndex);
			save("playbackOrder", this.playbackOrder);
			save("elapsedSeconds", this.elapsedSeconds);
		},

		loadFromDisk() {
			this.$reset();
			const playbackOrder = load("playbackOrder");
			if (playbackOrder) {
				this.playbackOrder = playbackOrder;
			}
			const tracks = load("playlist");
			if (tracks) {
				this.songs = markRaw(tracks);
			}
			const currentTrackIndex = load("currentTrackIndex");
			if (currentTrackIndex && currentTrackIndex >= 0 && currentTrackIndex < this.songs.length) {
				this.currentTrack = this.songs[currentTrackIndex];
			}
			const elapsedSeconds = load("elapsedSeconds");
			if (this.currentTrack && elapsedSeconds) {
				this.elapsedSeconds = elapsedSeconds;
			}
			this.name = load("playlistName");
		},
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot));
}
