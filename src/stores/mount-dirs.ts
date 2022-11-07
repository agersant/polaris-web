import { defineStore, acceptHMRUpdate } from "pinia";
import { getMountDirs, putMountDirs } from "@/api/endpoints";
import { MountDir } from "@/api/dto";

export type MountDirsState = {
	listing: MountDir[];
	fetchedInitialState: boolean;
};

export const useMountDirsStore = defineStore("mountDirs", {
	state: (): MountDirsState => ({
		listing: [],
		fetchedInitialState: false,
	}),
	actions: {
		async refresh() {
			this.listing = await getMountDirs();
			this.fetchedInitialState = true;
		},

		async set(mountDirs: MountDir[]) {
			await putMountDirs(mountDirs);
			await this.refresh();
		},
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMountDirsStore, import.meta.hot));
}
