import { defineStore, acceptHMRUpdate } from "pinia";
import { computed } from "vue";
import { watchImmediate } from "@vueuse/core";

import { useUserStorage } from "@/storage";
import { applyTheme, getDefaultAccentHue, getDefaultTheme, getThemePolarity, Theme } from "@/theming/theming";

export const usePreferencesStore = defineStore("preferences", () => {
	const theme = useUserStorage("theme", getDefaultTheme());
	const accentBaseHue = useUserStorage("accentBaseHue", getDefaultAccentHue());
	const accentChromaMultiplier = useUserStorage("accentChromaMultiplier", 1.0);

	const polarity = computed(() => getThemePolarity(theme.value));

	watchImmediate([theme, accentBaseHue, accentChromaMultiplier], () => {
		applyTheme(theme.value, accentBaseHue.value, accentChromaMultiplier.value);
	});

	function setTheme(newTheme: Theme) {
		theme.value = newTheme;
	}

	function resetTheme() {
		theme.value = getDefaultTheme();
		accentBaseHue.value = getDefaultAccentHue();
		accentChromaMultiplier.value = 1.0;
	}

	return {
		accentBaseHue,
		accentChromaMultiplier,
		theme,
		polarity,
		setTheme,
		resetTheme,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
