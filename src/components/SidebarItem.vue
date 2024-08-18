<template>
    <a @click="props.action" :class="[
        props.current ? 'bg-accent-600 text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-accent-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300'
        , 'cursor-pointer group flex gap-x-3 rounded-md p-2 font-semibold leading-6']">
        <span class="material-icons-round h-6 w-6"
            :class="[props.current ? 'light:text-accent-600' : 'light:text-gray-400 light:group-hover:text-accent-600']">
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