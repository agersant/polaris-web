<template>
    <a @click="props.action" :class="[
        props.current ? 'bg-accent-600 dark:bg-accent-700 text-ls-0 dark:text-ds-0'
            : 'text-ls-600 hover:bg-ls-50 hover:text-accent-600 dark:text-ds-400 dark:hover:bg-ds-800 dark:hover:text-ds-300'
        , 'cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6']">
        <span class="material-icons-round"
            :class="[props.current ? '' : 'text-ls-400 group-hover:text-accent-600 dark:group-hover:text-ds-300']">
            {{ props.icon }}
        </span>
        {{ props.label }}
    </a>
</template>

<script setup lang="ts">
const props = defineProps<{
    label: string,
    icon: string,
    current?: boolean,
    action: () => void,
}>();
</script>