import { computed, Ref, ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { getPreferences, lastFMGetLinkToken, lastFMUnlink, putPreferences } from "@/api/endpoints";
import { useUserStore } from "@/stores/user";
import { applyTheme, getDefaultAccent, getDefaultTheme, Theme } from "@/theming/theming";

export const usePreferencesStore = defineStore("preferences", () => {
	const lastFMUsername: Ref<string | null> = ref(null);
	const theme: Ref<Theme | null> = ref(null);
	const themePreview: Ref<Theme | null> = ref(null);
	const accentColor: Ref<string | null> = ref(null);
	const accentColorPreview: Ref<string | null> = ref(null);

	const effectiveTheme = computed(() => themePreview.value || theme.value || getDefaultTheme());
	const effectiveAccentColor = computed(() => accentColorPreview.value || accentColor.value || getDefaultAccent());

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
		[effectiveTheme, effectiveAccentColor],
		() => {
			applyTheme(effectiveTheme.value, effectiveAccentColor.value);
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

	function previewTheme(newTheme: Theme) {
		theme.value = newTheme;
	}

	function previewAccentColor(newAccentColor: string) {
		accentColor.value = newAccentColor;
	}

	async function refresh() {
		const preferences = await getPreferences();
		lastFMUsername.value = preferences.lastfm_username || null;
		if (Object.values(Theme).some(t => t == preferences.web_theme_base)) {
			theme.value = <Theme>preferences.web_theme_base;
		} else {
			theme.value = null;
		}
		accentColor.value = preferences.web_theme_accent || null;
	}

	function reset() {
		lastFMUsername.value = null;
		theme.value = null;
		themePreview.value = null;
		accentColor.value = null;
		accentColorPreview.value = null;
	}

	function resetTheming() {
		previewTheme(getDefaultTheme());
		previewAccentColor(getDefaultAccent());
		saveTheming();
	}

	async function saveTheming() {
		await putPreferences(effectiveTheme.value, effectiveAccentColor.value);
		refresh();
	}

	async function unlinkLastFM() {
		await lastFMUnlink();
		refresh();
	}

	return {
		lastFMUsername,

		effectiveTheme,
		effectiveAccentColor,

		linkLastFM,
		previewTheme,
		previewAccentColor,
		resetTheming,
		saveTheming,
		unlinkLastFM,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
