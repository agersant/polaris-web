import { defineStore, acceptHMRUpdate } from "pinia";
import { ListPlaylistsEntry } from "@/api/dto";
import { playlists } from "@/api/endpoints";

export type PlaylistsState = {
	listing: ListPlaylistsEntry[];
};

export const usePlaylistsStore = defineStore("playlists", {
	state: (): PlaylistsState => ({
		listing: [],
	}),
	actions: {
		async refresh() {
			this.listing = await playlists();
		},
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePlaylistsStore, import.meta.hot));
}
