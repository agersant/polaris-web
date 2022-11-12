import { computed, Ref, ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { initialSetup } from "@/api/endpoints";
import { useUsersStore } from "@/stores/users";

export const useInitialSetupStore = defineStore("initialSetup", () => {
	const usersStore = useUsersStore();

	const hasAnyUsers: Ref<boolean | null> = ref(null);

	async function refresh() {
		const dto = await initialSetup();
		hasAnyUsers.value = dto.has_any_users;
	}

	const isStateKnown = computed(() => hasAnyUsers.value != null);
	const isComplete = computed(() => hasAnyUsers.value == true);

	watch(
		() => usersStore.listing,
		() => {
			refresh();
		}
	);

	return { refresh, isStateKnown, isComplete };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useInitialSetupStore, import.meta.hot));
}
