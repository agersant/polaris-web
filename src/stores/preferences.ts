import { computed, Ref, ref, watch } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { getPreferences, putPreferences } from "@/api/endpoints";
import { useUserStore } from "@/stores/user";
import { applyTheme, getDefaultAccent, getDefaultTheme, getThemePolarity, Theme } from "@/theming/theming";

export const usePreferencesStore = defineStore("preferences", () => {
	const theme: Ref<Theme | null> = ref(null);
	const themePreview: Ref<Theme | null> = ref(null);
	const accentColor: Ref<string | null> = ref(null);
	const accentColorPreview: Ref<string | null> = ref(null);

	const effectiveTheme = computed(() => themePreview.value || theme.value || getDefaultTheme());
	const effectiveAccentColor = computed(() => accentColorPreview.value || accentColor.value || getDefaultAccent());
	const effectivePolarity = computed(() => getThemePolarity(effectiveTheme.value));

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

	function previewTheme(newTheme: Theme) {
		theme.value = newTheme;
	}

	function previewAccentColor(newAccentColor: string) {
		accentColor.value = newAccentColor;
	}

	async function refresh() {
		const preferences = await getPreferences();
		if (Object.values(Theme).some(t => t == preferences.web_theme_base)) {
			theme.value = <Theme>preferences.web_theme_base;
		} else {
			theme.value = null;
		}
		accentColor.value = preferences.web_theme_accent || null;
	}

	function reset() {
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

	return {
		effectiveTheme,
		effectiveAccentColor,
		effectivePolarity,

		previewTheme,
		previewAccentColor,
		resetTheming,
		saveTheming,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
