<template>
    <div class="flex flex-col gap-4">
        <h2 v-text="title" class="text-2xl font-semibold text-ls-900 dark:text-ds-200" />
        <p v-text="description" class="mb-4 text-ls-500 dark:text-ds-400" />
        <slot />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string,
    description: string,
}>();
</script>
