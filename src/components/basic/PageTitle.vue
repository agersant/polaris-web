<template>
    <div
        class="mt-11 mb-8 pb-3 border-b border-ls-200 dark:border-ds-700 flex flex-col xl:flex-row gap-x-8 gap-y-4 xl:items-center justify-between">
        <div class="min-w-0 flex items-center">
            <h3 class="text-4xl text-ls-500 dark:text-ds-400 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ label }}
            </h3>
            <slot name="left" />
        </div>
        <slot name="right" />
        <div v-if="actions?.length" class="flex gap-2">
            <Button v-for="action in actions" :label="action.label" :icon="action.icon" :disabled="action.disabled"
                @click="action.action" :severity="action.danger ? 'danger' : 'secondary'" :data-pw="action.testID"
                class="grow" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/basic/Button.vue';

export type PageAction = {
    label?: string,
    icon?: string,
    disabled?: boolean,
    danger?: boolean,
    testID?: string,
    action: () => void,
};

defineProps<{
    label: string,
    actions?: PageAction[],
}>();

</script>
