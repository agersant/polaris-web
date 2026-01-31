<template>
    <div class="mt-11 mb-8 border-ls-200 dark:border-ds-700 flex flex-col xl:flex-row gap-x-8 gap-y-4 xl:items-center justify-between"
        :class="{ 'border-b': !$slots.jumbo, 'pb-3': !$slots.jumbo }">
        <slot name="jumbo">
            <div class="min-w-0 flex items-center">
                <h3 class="text-4xl text-ls-500 dark:text-ds-400 whitespace-nowrap overflow-hidden text-ellipsis">
                    {{ title }}
                </h3>
                <slot name="post-title" />
            </div>
        </slot>
        <slot name="right" />
        <div v-if="caption?.length"
            class="xl:hidden border-l-8 border-ls-200 dark:border-ds-700 my-1 pl-2 h-7 flex items-center">
            <div v-text="caption" class="italic text-sm text-ls-400 dark:text-ds-500" />
        </div>
        <div v-if="actions?.length" class="flex gap-2">
            <Button v-for="action in actions" :label="action.label" :icon="action.icon" :disabled="action.disabled"
                @click="action.action" :size="$slots.jumbo ? 'lg' : 'base'"
                :severity="action.danger ? 'danger' : 'secondary'" :data-pw="action.testID" class="grow" />
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
    title: string,
    caption?: string,
    actions?: PageAction[],
}>();

</script>
