<template>
    <button type="button" :class="buttonClass" class="inline-flex items-center gap-x-1.5 rounded-md text-sm font-semibold
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    
    
    focus-visible:outline-accent-600 dark:focus-visible:outline-accent-600">
        <span v-if="props.icon" class="material-icons-round">{{ props.icon }}</span>
        {{ props.label }}
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    label: string,
    icon?: string,
    text?: boolean,
    severity?: "primary" | "secondary",
    size?: "base" | "lg" | "xl",
}>(), {
    severity: "primary",
    size: "base"
});

let palettes = {
    opaque: {
        primary: ["bg-accent-600", "hover:bg-accent-500", "text-ls-0", "dark:bg-accent-600", "dark:hover:bg-accent-500", "dark:text-ds-0"],
        secondary: ["bg-ls-50", "hover:bg-ls-100", "text-ls-600", "dark:bg-ds-800", "dark:hover:bg-ds-700", "dark:text-ds-300"],
    },
    text: {
        primary: ["bg-transparent", "hover:bg-ds-500/5", "text-accent-600", "dark:hover:bg-white/5"],
        secondary: ["bg-transparent", "hover:bg-ds-500/5", "text-ls-600", "dark:text-ls-400", "dark:hover:bg-white/5"],
    },
};

const buttonClass = computed(() => {

    const palette = palettes[props.text ? "text" : "opaque"][props.severity];

    let padding = ["px-2.5", "py-1.5"];
    if (props.size == "lg") {
        padding = ["px-3", "py-2"];
    } else if (props.size == "xl") {
        padding = ["px-3.5", "py-2.5"];
    }

    return [
        ...(props.text ? [] : ["shadow-sm"]),
        ...padding,
        ...palette,
    ];
});
</script>
