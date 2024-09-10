<template>
    <button type="button" :class="buttonClass" :disabled="disabled"
        class="inline-flex items-center justify-center gap-x-1.5 rounded-md shadow-sm text-sm font-semibold whitespace-nowrap">
        <span v-if="icon" class="material-icons-round" :class="iconClass">
            {{ icon }}
        </span>
        <span v-if="label?.length" v-text="label" />
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { severity = "primary", size = "base", ...props } = defineProps<{
    label?: string,
    icon?: string,
    disabled?: boolean,
    severity?: "primary" | "secondary",
    size?: "sm" | "base" | "lg" | "xl",
}>();

let palettes = {
    disabled: `
        bg-ls-400 text-ls-200
        dark:bg-ds-800 dark:text-ds-500
    `,
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

let sizes = {
    sm: "px-1.5 py-1",
    base: "px-2.5 py-1.5",
    lg: "px-3 py-2",
    xl: "px-3.5 py-2.5",
};

const buttonClass = computed(() => {
    const palette = props.disabled ? palettes.disabled : palettes[severity];
    return [
        props.disabled ? "cursor-not-allowed" : "cursor-pointer [&>*]:active:translate-y-px",
        sizes[size],
        palette,
    ];
});

const iconClass = computed(() => {
    return [
        props.label?.length ? "text-ls-400 dark:text-ds-200" : "text-ls-900 dark:text-ds-0",
    ];
});
</script>
