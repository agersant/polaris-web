import { defineStore, acceptHMRUpdate } from "pinia";
import { initialSetup } from "@/api/endpoints";

export type InitialSetupState = {
	hasAnyUsers: boolean | null;
};

export const useInitialSetupStore = defineStore("initialSetup", {
	state: (): InitialSetupState => ({
		hasAnyUsers: null,
	}),
	actions: {
		async refresh() {
			const dto = await initialSetup();
			this.hasAnyUsers = dto.has_any_users;
		},
	},
	getters: {
		isStateKnown: state => state.hasAnyUsers != null,
		isComplete: state => state.hasAnyUsers == true,
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useInitialSetupStore, import.meta.hot));
}
