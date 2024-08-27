<template>
    <button type="button" :class="buttonClass"
        class="inline-flex items-center justify-center gap-x-1.5 rounded-md shadow-sm text-sm font-semibold [&>*]:active:translate-y-px">
        <span v-if="props.icon" class="material-icons-round text-ls-400 dark:text-ds-200">
            {{ props.icon }}
        </span>
        <span>{{ props.label }}</span>
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    label: string,
    icon?: string,
    severity?: "primary" | "secondary",
    size?: "base" | "lg" | "xl",
}>(), {
    severity: "primary",
    size: "base"
});

let palettes = {
    primary: `
        bg-accent-600 hover:bg-accent-500 text-ls-0
        dark:bg-accent-600 dark:hover:bg-accent-500 dark:text-ds-0
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 
    `,
    secondary: `
        bg-ls-0 hover:bg-ls-50 text-ls-900
        dark:bg-ds-0/10 dark:hover:bg-ds-0/20 dark:text-ds-0
        ring-1 ring-inset ring-ls-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 
        dark:ring-0
    `,
};

const buttonClass = computed(() => {

    const palette = palettes[props.severity];

    let padding = "px-2.5 py-1.5";
    if (props.size == "lg") {
        padding = "px-3 py-2";
    } else if (props.size == "xl") {
        padding = "px-3.5 py-2.5";
    }

    return [
        padding,
        palette,
    ];
});
</script>
