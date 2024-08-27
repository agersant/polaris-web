<template>
    <div class="mt-11 pb-3 border-b border-ls-200 flex items-center justify-between">
        <h3 class="text-4xl tracking-wider text-ls-500">{{ label }}</h3>
        <slot name="right" />
    </div>
</template>

<script setup lang="ts">

defineProps<{ label: string }>();

</script>