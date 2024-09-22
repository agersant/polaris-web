<template>
    <div class="mb-8 flex items-center gap-4 justify-between">
        <div class="flex items-center gap-2">
            <span v-if="icon" class="material-icons-round text-ls-400 dark:text-ds-500" v-text="icon" />
            <div v-text="label" class="text-sm uppercase font-medium text-ls-500 dark:text-ds-400" />
            <slot />
        </div>
        <slot name="right" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string,
    icon?: string,
}>();
</script>
