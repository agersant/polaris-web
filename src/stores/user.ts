import { computed, Ref, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { login as doLogin } from "@/api/endpoints";

const STORAGE_USERNAME = "username";
const STORAGE_AUTH_TOKEN = "authToken";
const STORAGE_IS_ADMIN = "isAdmin";

export const useUserStore = defineStore("user", () => {
	const name: Ref<string | null> = ref(null);
	const authToken: Ref<string | null> = ref(null);
	const isAdmin = ref(false);

	const isLoggedIn = computed(() => !!authToken.value);

	reset();
	loadFromDisk();

	async function login(username: string, password: string) {
		const authorization = await doLogin(username, password);

		reset();
		name.value = username;
		authToken.value = authorization.token;
		isAdmin.value = authorization.is_admin;
		saveToDisk();
	}

	function loadFromDisk() {
		reset();
		name.value = localStorage[STORAGE_USERNAME];
		authToken.value = localStorage[STORAGE_AUTH_TOKEN];
		isAdmin.value = localStorage[STORAGE_IS_ADMIN];
	}

	function logout() {
		reset();
		saveToDisk();
	}

	function reset() {
		name.value = null;
		authToken.value = null;
		isAdmin.value = false;
	}

	function saveToDisk() {
		localStorage[STORAGE_USERNAME] = name.value;
		localStorage[STORAGE_AUTH_TOKEN] = authToken.value;
		localStorage[STORAGE_IS_ADMIN] = isAdmin.value;
	}

	return {
		authToken,
		isAdmin,
		name,

		isLoggedIn,

		login,
		logout,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
