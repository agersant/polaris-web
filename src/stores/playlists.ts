import { defineStore, StoreDefinition } from "pinia";
import { ListPlaylistsEntry } from "@/api/dto";
import { playlists } from "@/api/endpoints";
import { ViteHotContext } from "vite/types/hot";

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
function acceptHMRUpdate(usePlaylistsStore: StoreDefinition<"playlists", PlaylistsState, {}, { refresh(): Promise<void> }>, hot: ViteHotContext): (mod: any) => void {
	throw new Error("Function not implemented.");
}
