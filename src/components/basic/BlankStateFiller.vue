<template>
    <div>
        <span class="material-icons-round text-5xl text-ls-400 dark:text-ds-600">{{ icon }}</span>
        <p class="mt-1 text-sm leading-6 text-ls-500 dark:text-ds-400">
            <slot />
        </p>
    </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string }>();
</script>
