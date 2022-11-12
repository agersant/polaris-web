import { computed, Ref, ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { getPreferences, lastFMGetLinkToken, lastFMUnlink, putPreferences } from "@/api/endpoints";
import { useUserStore } from "@/stores/user";
import { applyTheme, getDefaultAccent, getDefaultBaseID } from "@/theming/theming";

export const usePreferencesStore = defineStore("preferences", () => {
	const lastFMUsername: Ref<string | null> = ref(null);
	const themeBase: Ref<string | null> = ref(null); // TODO enum
	const themeAccent: Ref<string | null> = ref(null);
	const themeBasePreview: Ref<string | null> = ref(null);
	const themeAccentPreview: Ref<string | null> = ref(null);

	const accent = computed(() => themeAccentPreview.value || themeAccent.value || getDefaultAccent());
	const theme = computed(() => themeBasePreview.value || themeBase.value || getDefaultBaseID());

	reset();

	const userStore = useUserStore();
	watch(
		() => userStore.isLoggedIn,
		() => {
			if (userStore.isLoggedIn) {
				refresh();
			} else {
				reset();
			}
		},
		{ immediate: true }
	);

	watch(
		[theme, accent],
		() => {
			applyTheme(theme.value, accent.value);
		},
		{ immediate: true }
	);

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
					refresh();
				}
			},
			false
		);
	}

	function previewThemeBase(themeBase: string) {
		themeBasePreview.value = themeBase;
	}

	function previewThemeAccent(themeAccent: string) {
		themeAccentPreview.value = themeAccent;
	}

	async function refresh() {
		const preferences = await getPreferences();
		lastFMUsername.value = preferences.lastfm_username || null;
		themeBase.value = preferences.web_theme_base || null;
		themeAccent.value = preferences.web_theme_accent || null;
	}

	function reset() {
		lastFMUsername.value = null;
		themeBase.value = null;
		themeAccent.value = null;
		themeBasePreview.value = null;
		themeAccentPreview.value = null;
	}

	async function saveTheme() {
		await putPreferences(theme.value, accent.value);
		refresh();
	}

	async function unlinkLastFM() {
		await lastFMUnlink();
		refresh();
	}

	return {
		lastFMUsername,

		accent,
		theme,

		linkLastFM,
		previewThemeAccent,
		previewThemeBase,
		saveTheme,
		unlinkLastFM,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
