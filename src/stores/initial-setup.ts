import { computed, Ref, ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { initialSetup } from "@/api/endpoints";
import { useUsersStore } from "@/stores/users";

export const useInitialSetupStore = defineStore("initialSetup", () => {
	const usersStore = useUsersStore();

	const hasAnyUsers: Ref<boolean | null> = ref(null);

	const isStateKnown = computed(() => hasAnyUsers.value != null);
	const isComplete = computed(() => hasAnyUsers.value == true);

	async function refresh() {
		const dto = await initialSetup();
		hasAnyUsers.value = dto.has_any_users;
	}

	watch(
		() => usersStore.listing.length == 0,
		() => {
			refresh();
		},
		{ immediate: true }
	);

	return { isStateKnown, isComplete, refresh };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useInitialSetupStore, import.meta.hot));
}
