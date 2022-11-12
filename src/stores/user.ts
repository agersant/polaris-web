import { computed, Ref, ref } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { login as doLogin, getPreferences, putPreferences, lastFMGetLinkToken, lastFMUnlink } from "@/api/endpoints";
import { getDefaultBaseID, getDefaultAccent } from "@/theming/theming";

const STORAGE_USERNAME = "username";
const STORAGE_AUTH_TOKEN = "authToken";
const STORAGE_IS_ADMIN = "isAdmin";

export type UserState = {
	name: string | null;
	authToken: string | null;
	isAdmin: boolean;
	lastFMUsername: string | null;
	themeBase: string | null;
	themeAccent: string | null;
	themeBasePreview: string | null;
	themeAccentPreview: string | null;
};

export const useUserStore = defineStore("user", () => {
	const name: Ref<string | null> = ref(null);
	const authToken: Ref<string | null> = ref(null);
	const isAdmin = ref(false);

	const lastFMUsername: Ref<string | null> = ref(null);
	const themeBase: Ref<string | null> = ref(null); // TODO enum
	const themeAccent: Ref<string | null> = ref(null);
	const themeBasePreview: Ref<string | null> = ref(null);
	const themeAccentPreview: Ref<string | null> = ref(null);

	reset();

	async function linkLastFM() {
		const linkToken = await lastFMGetLinkToken();
		const apiKey = "02b96c939a2b451c31dfd67add1f696e";
		const currentURL = new URL(window.location.href);
		const successPopupContent = window.btoa(
			`<!doctype html>
				<html>
					<head>
						<title>Polaris</title>
						<meta charset="UTF-8">
					</head>
					<body>
						<script type="text/javascript">
							window.opener.postMessage("polaris-lastfm-auth-success", "*");
						<\/script>
					</body>
				</html>`
		);

		let callbackURL = currentURL.protocol + "//" + currentURL.host + "/api/lastfm/link?content=" + encodeURIComponent(successPopupContent) + "&auth_token=" + linkToken;
		let url = "https://www.last.fm/api/auth/?api_key=" + apiKey + "&cb=" + encodeURIComponent(callbackURL);
		let windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
		let lastFMPopup = window.open(url, "Link Last.fm account", windowFeatures);
		window.addEventListener(
			"message",
			event => {
				if (event.source != lastFMPopup) {
					return;
				}
				if (event.data == "polaris-lastfm-auth-success") {
					if (lastFMPopup) {
						lastFMPopup.close();
					}
					refreshPreferences();
				}
			},
			false
		);
	}

	async function login(username: string, password: string) {
		const authorization = await doLogin(username, password);

		reset();
		name.value = username;
		authToken.value = authorization.token;
		isAdmin.value = authorization.is_admin;
		saveToDisk();

		await refreshPreferences(); // TODO Make a preferences store for this
	}

	function logout() {
		reset();
		saveToDisk();
	}

	function previewThemeBase(themeBase: string) {
		themeBasePreview.value = themeBase;
	}

	function previewThemeAccent(themeAccent: string) {
		themeAccentPreview.value = themeAccent;
	}

	async function refreshPreferences() {
		const preferences = await getPreferences();
		lastFMUsername.value = preferences.lastfm_username || null;
		themeBase.value = preferences.web_theme_base || null;
		themeAccent.value = preferences.web_theme_accent || null;
	}

	function reset() {
		name.value = null;
		authToken.value = null;
		isAdmin.value = false;
		lastFMUsername.value = null;
		themeBase.value = null;
		themeAccent.value = null;
		themeBasePreview.value = null;
		themeAccentPreview.value = null;
	}

	async function saveTheme() {
		await putPreferences(theme.value, accent.value);
		refreshPreferences();
	}

	function saveToDisk() {
		localStorage[STORAGE_USERNAME] = name.value;
		localStorage[STORAGE_AUTH_TOKEN] = authToken.value;
		localStorage[STORAGE_IS_ADMIN] = isAdmin.value;
	}

	async function unlinkLastFM() {
		await lastFMUnlink();
		refreshPreferences();
	}

	const accent = computed(() => themeAccentPreview.value || themeAccent.value || getDefaultAccent());
	const isLoggedIn = computed(() => !!authToken.value);
	const theme = computed(() => themeBasePreview.value || themeBase.value || getDefaultBaseID());

	return {
		authToken,
		lastFMUsername,
		name,

		linkLastFM,
		login,
		logout,
		previewThemeAccent,
		previewThemeBase,
		refreshPreferences,
		saveTheme,
		unlinkLastFM,

		accent,
		isLoggedIn,
		theme,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
