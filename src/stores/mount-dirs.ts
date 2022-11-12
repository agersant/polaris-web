import { Ref, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { getMountDirs, putMountDirs } from "@/api/endpoints";
import { MountDir } from "@/api/dto";

export type MountDirsState = {
	listing: MountDir[];
	fetchedInitialState: boolean;
};

export const useMountDirsStore = defineStore("mountDirs", () => {
	const fetchedInitialState = ref(false);
	const listing: Ref<MountDir[]> = ref([]);

	function create() {
		listing.value.push({ name: "", source: "" });
	}

	async function refresh() {
		listing.value = await getMountDirs();
		fetchedInitialState.value = true;
	}

	function remove(mountDir: MountDir) {
		const index = listing.value.indexOf(mountDir);
		if (index >= 0) {
			listing.value.splice(index, 1);
		}
		save();
	}

	async function overwrite(mountDirs: MountDir[]) {
		listing.value = mountDirs;
		await save();
	}

	async function save() {
		const response = await putMountDirs(listing.value);
		if (response.ok) {
			await refresh();
		}
	}

	return {
		fetchedInitialState,
		listing,

		create,
		overwrite,
		refresh,
		remove,
		save,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useMountDirsStore, import.meta.hot));
}
