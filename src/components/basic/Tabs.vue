<template>
    <div class="mb-8 flex space-x-4 whitespace-nowrap">
        <div v-for="tab in tabs" @click="current = tab.value" :data-pw="tab.testID"
            class="h-10 flex items-center cursor-pointer rounded-md px-3 text-sm font-medium" :class="tab.value == current
                ? 'bg-accent-100 text-accent-700 dark:bg-ds-700 dark:text-ds-50'
                : 'text-ls-500 hover:text-ls-700 dark:text-ds-300 dark:hover:text-ls-100'
                ">
            {{ tab.label }}
        </div>
    </div>
</template>

<script setup lang="ts" generic="T">
export type TabItem<T> = {
    value: T,
    label: string,
    testID?: string,
};

defineProps<{ tabs: TabItem<T>[] }>();

const current = defineModel<T>({ required: true });
</script>
