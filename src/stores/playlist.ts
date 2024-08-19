import { Ref, ref, ShallowRef, shallowRef, toRaw, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { flatten, getPlaylist } from "@/api/endpoints";
import { saveForCurrentUser, loadForCurrentUser } from "@/disk";
import { useUserStore } from "@/stores/user";

export type PlaybackOrder = "default" | "random" | "repeat-track" | "repeat-all";

interface PlaylistEntry {
	path: string,
}

export const usePlaylistStore = defineStore("playlist", () => {
	const name = ref("");
	const entries: ShallowRef<PlaylistEntry[]> = shallowRef([]);
	const currentTrack: Ref<PlaylistEntry | null> = ref(null);
	const playbackOrder: Ref<PlaybackOrder> = ref("default");
	const elapsedSeconds = ref(0);

	reset();

	const userStore = useUserStore();
	watch(
		() => userStore.isLoggedIn,
		() => {
			if (userStore.isLoggedIn) {
				loadFromDisk();
			} else {
				reset();
			}
		},
		{ immediate: true }
	);

	function advance(delta: number): PlaylistEntry | null {
		const order = playbackOrder.value;
		const tracks = entries.value;
		const numTracks = tracks.length;

		let newTrack = null;
		if (numTracks > 0) {
			if (order == "random") {
				const newTrackIndex = Math.floor(Math.random() * numTracks);
				newTrack = tracks[newTrackIndex];
			} else if (order == "repeat-track") {
				newTrack = currentTrack.value;
			} else {
				const rawCurrentTrack = toRaw(currentTrack.value);
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
					} else if (order == "repeat-all") {
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
			currentTrack.value = newTrack;
			elapsedSeconds.value = 0;
		}

		return newTrack;
	}

	function play(track: PlaylistEntry) {
		if (track != currentTrack.value) {
			currentTrack.value = track;
			elapsedSeconds.value = 0;
		}
		savePlaybackState();
	}

	function next(): PlaylistEntry | null {
		const advancedTo = advance(1);
		savePlaybackState();
		return advancedTo;
	}

	function previous(): PlaylistEntry | null {
		const advancedTo = advance(-1);
		savePlaybackState();
		return advancedTo;
	}

	function clear() {
		entries.value = [];
		name.value = "";
		savePlaylist();
	}

	function enqueue(tracks: PlaylistEntry[]) {
		entries.value = entries.value.concat(tracks);
		if (!currentTrack.value && entries.value.length > 0) {
			currentTrack.value = entries.value[0];
		}
	}

	function queueTracks(tracks: string[]) {
		enqueue(tracks.map(s => { return { path: s } }));
		savePlaylist();
	}

	async function queueDirectory(path: string) {
		const flattened = await flatten(path);
		enqueue(flattened.paths.map((p) => { return { path: p } }));
		savePlaylist();
	}

	async function queuePlaylist(playlistName: string) {
		const songList = await getPlaylist(playlistName);
		entries.value = songList.paths.map((p) => { return { path: p } });
		name.value = playlistName;
		savePlaylist();
	}

	function removeTrack(track: PlaylistEntry) {
		const trackIndex = entries.value.indexOf(track);
		if (trackIndex >= 0) {
			let newSongs = [...entries.value];
			newSongs.splice(trackIndex, 1);
			entries.value = newSongs;
		}
		savePlaylist();
	}

	function reset() {
		name.value = "";
		playbackOrder.value = "default";
		currentTrack.value = null;
		entries.value = [];
		elapsedSeconds.value = 0;
	}

	function loadFromDisk() {
		playbackOrder.value = loadForCurrentUser("playbackOrder") || "default";
		entries.value = loadForCurrentUser("playlist") || [];
		currentTrack.value = entries.value[loadForCurrentUser("currentTrackIndex") || 0] || null;
		elapsedSeconds.value = loadForCurrentUser("elapsedSeconds") || 0;
		name.value = loadForCurrentUser("playlistName") || null;
	}

	function savePlaybackState() {
		const rawCurrentTrack = toRaw(currentTrack.value);
		let currentTrackIndex = -1;
		if (rawCurrentTrack) {
			currentTrackIndex = entries.value.indexOf(rawCurrentTrack);
		}

		saveForCurrentUser("currentTrackIndex", currentTrackIndex);
		saveForCurrentUser("playbackOrder", playbackOrder.value);
		saveForCurrentUser("elapsedSeconds", elapsedSeconds.value);
	}

	function savePlaylist() {
		if (saveForCurrentUser("playlist", entries.value)) {
			saveForCurrentUser("playlistName", name.value);
			savePlaybackState();
		}
	}

	function setElapsedSeconds(seconds: number) {
		elapsedSeconds.value = seconds;
		savePlaybackState();
	}

	function setName(newName: string) {
		name.value = newName;
		savePlaylist();
	}

	function setPlaybackOrder(order: PlaybackOrder) {
		playbackOrder.value = order;
		savePlaybackState();
	}

	function shuffle() {
		let shuffled = [...entries.value];
		for (let i = shuffled.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		entries.value = shuffled;
		savePlaylist();
	}

	return {
		currentTrack,
		elapsedSeconds,
		name,
		playbackOrder,
		entries,

		clear,
		next,
		play,
		previous,
		queueDirectory,
		queuePlaylist,
		queueTracks,
		removeTrack,
		setElapsedSeconds,
		setPlaybackOrder,
		setName,
		shuffle,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot));
}
