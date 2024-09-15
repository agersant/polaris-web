<template>
    <div class="mt-11 mb-8 pb-3 border-b border-ls-200 dark:border-ds-700 flex items-center justify-between">
        <div class="min-w-0 flex items-center">
            <h3 class="text-4xl text-ls-500 dark:text-ds-400 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ label }}
            </h3>
            <slot name="left" />
        </div>
        <slot name="right" />
    </div>
</template>

<script setup lang="ts">

defineProps<{ label: string }>();

</script>