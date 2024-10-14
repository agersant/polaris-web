<template>

	<div class="flex flex-col gap-8 rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
		<Select v-model="theme" label="Theme" :options="themeOptions" class="w-48" />
		<Slider v-model="preferences.accentBaseHue" label="Accent Hue" class="w-80" :min="0" :max="360" />
		<Slider v-model="preferences.accentChromaMultiplier" label="Accent Saturation" class="w-80" :min="0" :max="2" />
		<Button label="Reset to Default" icon="restore" severity="danger" size="xl" class="self-end"
			@click="preferences.resetTheme" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { usePreferencesStore } from "@/stores/preferences";
import { getThemeName, Theme } from "@/theming/theming";
import Button from "@/components/basic/Button.vue";
import Select, { SelectOption } from "@/components/basic/Select.vue";
import Slider from "@/components/basic/Slider.vue";

const preferences = usePreferencesStore();

const themeOptions: SelectOption<Theme>[] = Object.values(Theme).map(t => ({ label: getThemeName(t), value: t }));

const theme = computed({
	set(option: SelectOption<Theme>) {
		preferences.setTheme(option.value);
	},
	get() {
		return themeOptions.find(o => o.value == preferences.theme) || themeOptions[0];
	},
});
</script>
