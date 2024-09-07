<template>
    <span class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1
        font-medium text-xs whitespace-nowrap
        text-ls-700 dark:text-ds-300
        ring-1 ring-inset
        ring-ls-200 dark:ring-white/10">
        <svg class="h-1.5 w-1.5" viewBox="0 0 6 6" :class="palette">
            <circle cx="3" cy="3" r="3" />
        </svg>
        {{ label }}
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Tint = "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

const props = defineProps<{
    label: string,
    color?: Tint;
    autoColor: boolean,
}>();

const palettes = {
    red: "fill-red-500 dark:fill-red-600",
    orange: "fill-orange-500 dark:fill-orange-600",
    amber: "fill-amber-500 dark:fill-amber-600",
    yellow: "fill-yellow-500 dark:fill-yellow-600",
    lime: "fill-lime-500 dark:fill-lime-600",
    green: "fill-green-500 dark:fill-green-600",
    emerald: "fill-emerald-500 dark:fill-emerald-600",
    teal: "fill-teal-500 dark:fill-teal-600",
    cyan: "fill-cyan-500 dark:fill-cyan-600",
    sky: "fill-sky-500 dark:fill-sky-600",
    blue: "fill-blue-500 dark:fill-blue-600",
    indigo: "fill-indigo-500 dark:fill-indigo-600",
    violet: "fill-violet-500 dark:fill-violet-600",
    purple: "fill-purple-500 dark:fill-purple-600",
    fuchsia: "fill-fuchsia-500 dark:fill-fuchsia-600",
    pink: "fill-pink-500 dark:fill-pink-600",
    rose: "fill-rose-500 dark:fill-rose-600",
};

// https://en.wikipedia.org/wiki/Pearson_hashing
const lut = [...new Array(256)].map((_, i) => i);
function hash(s: string): number {
    return s.split('').reduce((hash, c) => {
        return lut[(hash + c.charCodeAt(0)) % (lut.length - 1)]
    }, s.length % (lut.length - 1))
}

const palette = computed(() => {
    let palette = palettes[props.color || "red"];
    if (props.autoColor) {
        const tints = Object.keys(palettes);
        const tint = tints[hash(props.label) % tints.length] as Tint;
        palette = palettes[tint];
    }
    return palette;
});

</script>
