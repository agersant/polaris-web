<template>
    <button type="button" :class="buttonClass" class="rounded-md text-sm font-semibold text-ls-0 dark:text-ls-0 shadow-sm
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
    bg-accent-600 dark:bg-accent-600
    hover:bg-accent-500 dark:hover:bg-accent-500
    focus-visible:outline-accent-600 dark:focus-visible:outline-accent-600">
        {{ props.label }}
    </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
    label: string,
    size?: "base" | "lg" | "xl"
}>(), { size: "base" });

const buttonClass = computed(() => {
    return [
        ...(props.size == "base" ? ["px-2.5", "py-1.5"] : []),
        ...(props.size == "lg" ? ["px-3", "py-2"] : []),
        ...(props.size == "xl" ? ["px-3.5", "py-2.5"] : []),
    ];
});
</script>
