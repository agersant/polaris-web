import { defineStore, acceptHMRUpdate } from "pinia";
import { markRaw, Ref, ref } from "vue";

import { Playlist, PlaylistHeader } from "@/api/dto";
import { deletePlaylist as doDeletePlaylist, getPlaylist, listPlaylists, putPlaylist } from "@/api/endpoints";
import { usePlaybackStore } from "./playback";

export type PlaylistsState = {
	listing: PlaylistHeader[];
};

export const usePlaylistsStore = defineStore("playlists", () => {

	const listing: Ref<PlaylistHeader[]> = ref([]);
	const playlists: Ref<Map<string, Playlist>> = ref(new Map());

	async function fetchList() {
		listing.value = await listPlaylists();
		return listing.value;
	}

	async function fetchPlaylist(name: string) {
		const playlist = markRaw(await getPlaylist(name));
		playlists.value.set(name, playlist);
		return playlist;
	}

	async function save() {
		const playback = usePlaybackStore();
		const name = playback.name;
		await putPlaylist(name, playback.playlist.map(e => e.path));
		await Promise.all([fetchList(), fetchPlaylist(name)]);
	}

	async function deletePlaylist(name: string) {
		await doDeletePlaylist(name);
		await fetchList();
	}

	return {
		listing,
		playlists,

		deletePlaylist,
		fetchList,
		fetchPlaylist,
		save,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistsStore, import.meta.hot));
}
