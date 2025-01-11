<template>
    <button type="button" :class="buttonClass" :disabled="disabled" :data-pw="testID"
        class="inline-flex items-center justify-center gap-x-1.5 rounded-md text-sm font-semibold whitespace-nowrap">
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
    severity?: "primary" | "secondary" | "tertiary" | "danger",
    size?: "sm" | "base" | "lg" | "xl",
    testID?: string,
}>();

let palettes = {
    disabled: `
        bg-ls-400 text-ls-200
        dark:bg-ds-800 dark:text-ds-500
        shadow-sm
        `,
    primary: `
        bg-accent-600 hover:bg-accent-500 text-ls-0
        dark:bg-accent-600 dark:hover:bg-accent-500 dark:text-ds-0
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 
        shadow-sm
        `,
    secondary: `
        bg-ls-0 hover:bg-ls-50 text-ls-900
        dark:bg-ds-0/10 dark:hover:bg-ds-0/20 dark:text-ds-0
        ring-1 ring-inset ring-ls-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 
        dark:ring-0
        shadow-sm
    `,
    tertiary: `
        hover:bg-ls-100 text-ls-700
        dark:hover:bg-ds-0/20 dark:text-ds-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 
    `,
    danger: `
        bg-red-600 hover:bg-red-500 text-ls-0
        dark:bg-red-600 dark:hover:bg-red-500 dark:text-ds-0
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 
        shadow-sm
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
    if (props.disabled) {
        return "text-ls-200 dark:text-ds-500";
    } else if (severity == "tertiary") {
        return props.label?.length ? "text-ls-400 dark:text-ds-300" : "text-ls-700 dark:text-ds-200";
    } else if (severity == "secondary") {
        return props.label?.length ? "text-ls-400 dark:text-ds-300" : "text-ls-700 dark:text-ds-200";
    } else if (severity == "danger") {
        return "text-red-50 dark:text-red-50";
    } else {
        return "text-ls-50 dark:text-ds-50";
    }
});
</script>
