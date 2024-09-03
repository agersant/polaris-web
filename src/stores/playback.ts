import { computed, Ref, ref, ShallowRef, shallowRef, watch } from "vue";
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

export const usePlaybackStore = defineStore("playback", () => {
	const user = useUserStore();
	const songs = useSongsStore();

	const name = ref("");
	const playlist: ShallowRef<PlaylistEntry[]> = shallowRef([]);
	const currentTrack: Ref<PlaylistEntry | null> = ref(null);
	const currentSong = computed(() => {
		if (!currentTrack.value) {
			return undefined;
		}
		return songs.cache.get(currentTrack.value.path);
	});
	const playbackOrder: Ref<PlaybackOrder> = ref("default");
	const elapsedSeconds = ref(0);
	const duration = ref(0);

	reset();

	watch(
		() => user.isLoggedIn,
		() => {
			if (user.isLoggedIn) {
				loadFromDisk();
			} else {
				reset();
			}
		},
		{ immediate: true }
	);

	function hasPrevious(): boolean {
		return advance(-1) != null;
	}

	function hasNext(): boolean {
		return advance(1) != null;
	}

	function advance(delta: number): PlaylistEntry | null {
		const order = playbackOrder.value;
		const tracks = playlist.value;
		const numTracks = tracks.length;

		let newTrack = null;
		if (numTracks > 0) {
			if (order == "random") {
				const newTrackIndex = Math.floor(Math.random() * numTracks);
				newTrack = tracks[newTrackIndex];
			} else if (order == "repeat-track") {
				newTrack = currentTrack.value || tracks[0];
			} else {
				const currentTrackIndex = tracks.findIndex(t => t.key == currentTrack.value?.key);

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
		const newTrack = advance(1);
		if (newTrack) {
			currentTrack.value = newTrack;
			elapsedSeconds.value = 0;
		}
		savePlaybackState();
		return newTrack;
	}

	function previous(): PlaylistEntry | null {
		const newTrack = advance(-1);
		if (newTrack) {
			currentTrack.value = newTrack;
			elapsedSeconds.value = 0;
		}
		savePlaybackState();
		return newTrack;
	}

	function clear() {
		playlist.value = [];
		name.value = "";
		savePlaylist();
	}

	function reorder(movedTracks: PlaylistEntry[], newPosition: number) {
		const oldPlaylist = playlist.value;
		let newPlaylist: PlaylistEntry[] = [];
		let movedSet = new Set(movedTracks);
		let insertLocation = oldPlaylist.length - movedTracks.length;

		for (let i = 0; i < oldPlaylist.length; i++) {
			if (newPlaylist.length == newPosition) {
				insertLocation = newPlaylist.length;
			}
			if (!movedSet.has(oldPlaylist[i])) {
				newPlaylist.push(oldPlaylist[i]);
			}
		}

		newPlaylist.splice(insertLocation, 0, ...movedTracks);

		playlist.value = newPlaylist;
		savePlaylist();
	}

	function removeTracks(entriesToRemove: PlaylistEntry[]) {
		let removeKeys = new Set(entriesToRemove.map(e => e.key));
		playlist.value = playlist.value.filter(e => !removeKeys.has(e.key));
		savePlaylist();
	}

	function enqueue(tracks: string[], index: number) {
		let newPlaylist = [...playlist.value];
		newPlaylist.splice(index, 0, ...tracks.map(s => { return { key: make_key(), path: s } }));
		playlist.value = newPlaylist;
		if (!currentTrack.value && playlist.value.length > 0) {
			next();
		}
	}

	function queueTracks(tracks: string[], index?: number) {
		enqueue(tracks, index || playlist.value.length);
		savePlaylist();
	}

	async function queuePlaylist(playlistName: string) {
		const songList = await getPlaylist(playlistName);
		playlist.value = songList.paths.map((p) => { return { key: make_key(), path: p } });
		name.value = playlistName;
		savePlaylist();
	}

	function reset() {
		name.value = "";
		playbackOrder.value = "default";
		currentTrack.value = null;
		playlist.value = [];
		elapsedSeconds.value = 0;
	}

	function loadFromDisk() {
		const paths: string[] = loadForCurrentUser("playlist") || [];
		songs.request(paths);

		playlist.value = paths.map(p => { return { key: make_key(), path: p } });
		playbackOrder.value = loadForCurrentUser("playbackOrder") || "default";
		currentTrack.value = playlist.value[loadForCurrentUser("currentTrackIndex") || 0] || null;
		elapsedSeconds.value = loadForCurrentUser("elapsedSeconds") || 0;
		name.value = loadForCurrentUser("playlistName") || null;
	}

	function savePlaybackState() {
		const currentTrackIndex = playlist.value.findIndex(t => t.key == currentTrack.value?.key);
		saveForCurrentUser("currentTrackIndex", currentTrackIndex);
		saveForCurrentUser("playbackOrder", playbackOrder.value);
		saveForCurrentUser("elapsedSeconds", elapsedSeconds.value);
	}

	function savePlaylist() {
		if (saveForCurrentUser("playlist", playlist.value.map(e => e.path))) {
			saveForCurrentUser("playlistName", name.value);
			savePlaybackState();
		}
	}

	function setElapsedSeconds(seconds: number) {
		elapsedSeconds.value = seconds;
		savePlaybackState();
	}

	function setDuration(seconds: number) {
		duration.value = seconds;
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
		let shuffled = [...playlist.value];
		for (let i = shuffled.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		playlist.value = shuffled;
		savePlaylist();
	}

	return {
		currentSong,
		currentTrack,
		duration,
		elapsedSeconds,
		name,
		playbackOrder,
		playlist,

		clear,
		hasPrevious,
		hasNext,
		next,
		play,
		previous,
		queuePlaylist,
		queueTracks,
		removeTracks,
		reorder,
		setDuration,
		setElapsedSeconds,
		setPlaybackOrder,
		setName,
		shuffle,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaybackStore, import.meta.hot));
}
