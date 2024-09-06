<template>
    <span
        class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium text-ls-900 ring-1 ring-inset ring-ls-200">
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
    red: "fill-red-500",
    orange: "fill-orange-500",
    amber: "fill-amber-500",
    yellow: "fill-yellow-500",
    lime: "fill-lime-500",
    green: "fill-green-500",
    emerald: "fill-emerald-500",
    teal: "fill-teal-500",
    cyan: "fill-cyan-500",
    sky: "fill-sky-500",
    blue: "fill-blue-500",
    indigo: "fill-indigo-500",
    violet: "fill-violet-500",
    purple: "fill-purple-500",
    fuchsia: "fill-fuchsia-500",
    pink: "fill-pink-500",
    rose: "fill-rose-500",
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
