<template>
    <div class="flex flex-col gap-4">
        <h2 class="text-2xl font-semibold text-ls-900 dark:text-ds-200">{{ title }}</h2>
        <p class="mb-4 text-ls-500 dark:text-ds-400">{{ description }}</p>
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string,
    description: string,
}>();
</script>
