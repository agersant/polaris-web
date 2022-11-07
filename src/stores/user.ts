import { login, getPreferences, putPreferences, lastFMGetLinkToken, lastFMUnlink } from "@/api/endpoints";
import { usePlaylistStore } from "@/stores/playlist";
import { getDefaultBaseID, getDefaultAccent } from "@/theming/theming";
import { defineStore, acceptHMRUpdate } from "pinia";

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

export const useUserStore = defineStore("user", {
	state: (): UserState => ({
		name: localStorage.getItem(STORAGE_USERNAME),
		authToken: localStorage.getItem(STORAGE_AUTH_TOKEN),
		isAdmin: localStorage.getItem(STORAGE_IS_ADMIN) == "true",
		lastFMUsername: null,
		themeBase: null,
		themeAccent: null,
		themeBasePreview: null,
		themeAccentPreview: null,
	}),
	actions: {
		async login(username: string, password: string) {
			const authorization = await login(username, password);
			localStorage[STORAGE_USERNAME] = username;
			localStorage[STORAGE_AUTH_TOKEN] = authorization.token;
			localStorage[STORAGE_IS_ADMIN] = authorization.is_admin;
			this.$reset();
			usePlaylistStore().loadFromDisk(); // todo should be event-driven instead of calling playlist from here
			await this.refreshPreferences();
		},

		logout() {
			localStorage.removeItem(STORAGE_USERNAME);
			localStorage.removeItem(STORAGE_AUTH_TOKEN);
			localStorage.removeItem(STORAGE_IS_ADMIN);
			this.$reset();
		},

		async refreshPreferences() {
			const preferences = await getPreferences();
			this.lastFMUsername = preferences.lastfm_username || null;
			this.themeBase = preferences.web_theme_base || null;
			this.themeAccent = preferences.web_theme_accent || null;
		},

		previewThemeBase(themeBase: string) {
			this.themeBasePreview = themeBase;
		},

		previewThemeAccent(themeAccent: string) {
			this.themeAccentPreview = themeAccent;
		},

		async saveTheme() {
			await putPreferences(this.theme, this.accent);
			this.refreshPreferences();
		},

		async linkLastFM() {
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
						this.refreshPreferences();
					}
				},
				false
			);
		},

		async unlinkLastFM() {
			await lastFMUnlink();
			this.refreshPreferences();
		},
	},
	getters: {
		isLoggedIn: state => !!state.authToken,
		theme: state => state.themeBasePreview || state.themeBase || getDefaultBaseID(),
		accent: state => state.themeAccentPreview || state.themeAccent || getDefaultAccent(),
	},
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
