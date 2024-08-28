<template>
    <div class="mt-11 mb-8 pb-3 border-b border-ls-200 dark:border-ds-700 flex items-center justify-between">
        <h3 class="text-4xl tracking-wider text-ls-500 dark:text-ds-400 select-none">{{ label }}</h3>
        <slot name="right" />
    </div>
</template>

<script setup lang="ts">

defineProps<{ label: string }>();

</script>