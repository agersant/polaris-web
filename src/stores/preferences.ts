import { defineStore, acceptHMRUpdate } from "pinia";
import { computed, WritableComputedRef } from "vue";
import { watchImmediate } from "@vueuse/core";

import { useUserStorage } from "@/storage";
import { applyTheme, getDefaultAccentHue, getDefaultTheme, getThemePolarity, Theme } from "@/theming";

export type ArtistDisplayMode = "grid5" | "grid3" | "timeline";
export type ArtistListMode = "fixed" | "proportional";
export type SongListDisplayMode = "compact" | "tall";

export const usePreferencesStore = defineStore("preferences", () => {
	const accentBaseHue = useUserStorage("accentBaseHue", getDefaultAccentHue());
	const accentChromaMultiplier = useUserStorage("accentChromaMultiplier", 1.0);
	const theme = useUserStorage("theme", getDefaultTheme());
	const polarity = computed(() => getThemePolarity(theme.value));

	const artistDisplayMode: WritableComputedRef<ArtistDisplayMode> = useUserStorage("artistDisplayMode", "grid5");
	const artistListMode: WritableComputedRef<ArtistListMode> = useUserStorage("artistListMode", "fixed");
	const playlistDisplayMode: WritableComputedRef<SongListDisplayMode> = useUserStorage("playlistDisplayMode", "tall");
	const searchResultsDisplayMode: WritableComputedRef<SongListDisplayMode> = useUserStorage("searchResultsDisplayMode", "tall");
	const savedPlaylistDisplayMode: WritableComputedRef<SongListDisplayMode> = useUserStorage("savedPlaylistDisplayMode", "tall");

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
		polarity,
		theme,

		artistDisplayMode,
		artistListMode,
		playlistDisplayMode,
		searchResultsDisplayMode,
		savedPlaylistDisplayMode,

		setTheme,
		resetTheme,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(usePreferencesStore, import.meta.hot));
}
