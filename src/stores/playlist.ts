import { Ref, ref, ShallowRef, shallowRef, toRaw, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { getPlaylist } from "@/api/endpoints";
import { saveForCurrentUser, loadForCurrentUser } from "@/disk";
import { useSongsStore } from "@/stores/songs";
import { useUserStore } from "@/stores/user";

let next_key = 0;

function make_key() {
	next_key += 1;
	return next_key;
}

export type PlaybackOrder = "default" | "random" | "repeat-track" | "repeat-all";

export interface PlaylistEntry {
	key: number,
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

	function reorder(movedTracks: PlaylistEntry[], newPosition: number) {
		const oldEntries = entries.value;
		let newEntries: PlaylistEntry[] = [];
		let movedSet = new Set(movedTracks);
		let insertLocation = oldEntries.length - movedTracks.length;

		for (let i = 0; i < oldEntries.length; i++) {
			if (newEntries.length == newPosition) {
				insertLocation = newEntries.length;
			}
			if (!movedSet.has(oldEntries[i])) {
				newEntries.push(oldEntries[i]);
			}
		}

		newEntries.splice(insertLocation, 0, ...movedTracks);

		entries.value = newEntries;
		savePlaylist();
	}

	function removeTracks(entriesToRemove: PlaylistEntry[]) {
		let removeKeys = new Set(entriesToRemove.map(e => e.key));
		entries.value = entries.value.filter(e => !removeKeys.has(e.key));
		savePlaylist();
	}

	function enqueue(tracks: string[], index: number) {
		let newEntries = [...entries.value];
		newEntries.splice(index, 0, ...tracks.map(s => { return { key: make_key(), path: s } }));
		entries.value = newEntries;
		if (!currentTrack.value && entries.value.length > 0) {
			currentTrack.value = entries.value[0];
		}
	}

	function queueTracks(tracks: string[], index?: number) {
		enqueue(tracks, index || entries.value.length);
		savePlaylist();
	}

	async function queuePlaylist(playlistName: string) {
		const songList = await getPlaylist(playlistName);
		entries.value = songList.paths.map((p) => { return { key: make_key(), path: p } });
		name.value = playlistName;
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
		const songs = useSongsStore();
		const paths: string[] = loadForCurrentUser("playlist") || [];
		songs.request(paths);

		entries.value = paths.map(p => { return { key: make_key(), path: p } });
		playbackOrder.value = loadForCurrentUser("playbackOrder") || "default";
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
		if (saveForCurrentUser("playlist", entries.value.map(e => e.path))) {
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
		queuePlaylist,
		queueTracks,
		removeTracks,
		reorder,
		setElapsedSeconds,
		setPlaybackOrder,
		setName,
		shuffle,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistStore, import.meta.hot));
}
