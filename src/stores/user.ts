import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, Ref, watch } from "vue";
import { useRouter } from "vue-router";
import { StorageSerializers, useStorage } from "@vueuse/core";

import { login as doLogin } from "@/api/endpoints";

interface CurrentUser {
	name: string,
	authToken: string,
	isAdmin: boolean,
}

export const useUserStore = defineStore("user", () => {
	const user: Ref<CurrentUser | null> = useStorage("current_user", null, localStorage, { serializer: StorageSerializers.object });

	const name = computed(() => user.value?.name);
	const authToken = computed(() => user.value?.authToken);
	const isAdmin = computed(() => user.value?.isAdmin === true);
	const isLoggedIn = computed(() => authToken.value !== undefined);

	const router = useRouter();
	watch(isLoggedIn, () => { router.push("/").catch(_ => { }); });

	async function login(username: string, password: string): Promise<void> {
		const authorization = await doLogin(username, password);
		user.value = {
			name: username,
			authToken: authorization.token,
			isAdmin: authorization.is_admin,
		};
	}

	function logout() {
		user.value = null;
	}

	return {
		authToken,
		isAdmin,
		isLoggedIn,
		name,
		login,
		logout,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
