import { defineStore, acceptHMRUpdate } from "pinia";
import { Ref, ref } from "vue";

import { ListPlaylistsEntry } from "@/api/dto";
import { playlists, putPlaylist } from "@/api/endpoints";
import { usePlaybackStore } from "./playback";

export type PlaylistsState = {
	listing: ListPlaylistsEntry[];
};

export const usePlaylistsStore = defineStore("playlists", () => {

	const listing: Ref<ListPlaylistsEntry[]> = ref([]);

	async function refresh() {
		listing.value = await playlists();
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
