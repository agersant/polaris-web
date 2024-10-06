import { defineStore, acceptHMRUpdate } from "pinia";
import { Ref, ref } from "vue";

import { PlaylistHeader } from "@/api/dto";
import { playlists, putPlaylist } from "@/api/endpoints";
import { usePlaybackStore } from "./playback";

export type PlaylistsState = {
	listing: PlaylistHeader[];
};

export const usePlaylistsStore = defineStore("playlists", () => {

	const listing: Ref<PlaylistHeader[]> = ref([]);

	async function refresh() {
		listing.value = await playlists();
		return listing.value;
	}

	async function save() {
		const playback = usePlaybackStore();
		await putPlaylist(playback.name, playback.playlist.map(e => e.path));
		await refresh();
	}

	return {
		listing,

		refresh,
		save,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistsStore, import.meta.hot));
}
