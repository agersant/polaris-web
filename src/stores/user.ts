import { computed, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { defineStore, acceptHMRUpdate } from "pinia";
import { loadForAnyUser, saveForAnyUser } from "@/disk";
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

	const router = useRouter();
	watch(
		() => isLoggedIn.value,
		() => {
			router.push("/").catch(err => {});
		}
	);

	async function login(username: string, password: string): Promise<void> {
		const authorization = await doLogin(username, password);
		reset();
		name.value = username;
		authToken.value = authorization.token;
		isAdmin.value = authorization.is_admin;
		saveToDisk();
	}

	function loadFromDisk() {
		reset();
		name.value = loadForAnyUser(STORAGE_USERNAME);
		authToken.value = loadForAnyUser(STORAGE_AUTH_TOKEN);
		isAdmin.value = loadForAnyUser(STORAGE_IS_ADMIN) === "true";
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
		saveForAnyUser(STORAGE_USERNAME, name.value);
		saveForAnyUser(STORAGE_AUTH_TOKEN, authToken.value);
		saveForAnyUser(STORAGE_IS_ADMIN, isAdmin.value);
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
