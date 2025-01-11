<template>
	<div class="grow overflow-y-auto -mx-4 px-4">
		<div class="flex flex-col gap-8 rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
			<Select v-model="theme" label="Theme" :options="themeOptions" class="w-48" />
			<Slider v-model="preferences.accentBaseHue" label="Accent Hue" size="lg" :min="0" :max="360" class="w-80">
				<template #fill>
					<div class="absolute h-full w-full rounded-full" :style="hueScale" />
				</template>
			</Slider>
			<Slider v-model="preferences.accentChromaMultiplier" label="Accent Saturation" size="lg"
				:min="minChromaMultiplier" :max="maxChromaMultiplier" class="w-80">
				<template #fill>
					<div class="absolute h-full w-full rounded-full" :style="chromaScale" />
				</template>
			</Slider>
			<div class="flex flex-col">
				<div class="block mb-2 text-sm font-medium leading-6 text-ls-900 dark:text-ds-0">
					Preview
				</div>
				<div class="flex">
					<div class="w-8 h-8 bg-accent-50 rounded-l-md" />
					<div class="w-8 h-8 bg-accent-100" />
					<div class="w-8 h-8 bg-accent-200" />
					<div class="w-8 h-8 bg-accent-300" />
					<div class="w-8 h-8 bg-accent-400" />
					<div class="w-8 h-8 bg-accent-500" />
					<div class="w-8 h-8 bg-accent-600" />
					<div class="w-8 h-8 bg-accent-700" />
					<div class="w-8 h-8 bg-accent-800" />
					<div class="w-8 h-8 bg-accent-900 rounded-r-md" />
				</div>
			</div>
			<Button label="Reset to Default" icon="restore" severity="danger" size="xl" class="self-end"
				@click="preferences.resetTheme" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatCss } from "culori/fn";
import { computed } from "vue";

import Button from "@/components/basic/Button.vue";
import Select, { SelectOption } from "@/components/basic/Select.vue";
import Slider from "@/components/basic/Slider.vue";
import { usePreferencesStore } from "@/stores/preferences";
import { computeAccentRamp, getThemeName, Theme } from "@/theming";

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

const minChromaMultiplier = 0;
const maxChromaMultiplier = 2;

const hueScale = computed(() => {
	const stops = [];
	for (let i = 0; i <= 100; i++) {
		const color = computeAccentRamp(i / 100 * 360, preferences.accentChromaMultiplier)[5];
		stops.push(`${formatCss(color)} ${i}%`);
	}
	return `background: linear-gradient(90deg, ${stops.join(', ')});`
});

const chromaScale = computed(() => {
	const previewStop = preferences.polarity == "light" ? 6 : 7;
	const start = computeAccentRamp(preferences.accentBaseHue, minChromaMultiplier)[previewStop];
	const end = computeAccentRamp(preferences.accentBaseHue, maxChromaMultiplier)[previewStop];
	return `background: linear-gradient(90deg, ${formatCss(start)} 0%, ${formatCss(end)} 100%);`
});

</script>
