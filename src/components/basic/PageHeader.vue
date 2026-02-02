<template>
    <div class="mt-11 mb-8 border-ls-200 dark:border-ds-700 flex flex-col xl:flex-row gap-x-8 gap-y-4 xl:items-center justify-between"
        :class="{ 'border-b': !$slots.jumbo, 'pb-3': !$slots.jumbo }">
        <div class="min-w-0 flex flex-col items-start gap-y-4 xl:flex-row xl:items-center">
            <slot name="jumbo">
                <div class="min-w-0 flex items-center">
                    <h3 class="text-4xl text-ls-500 dark:text-ds-400 whitespace-nowrap overflow-hidden text-ellipsis">
                        {{ title }}
                    </h3>
                    <slot name="post-title" />
                </div>
            </slot>
            <SwitchText v-if="viewModes?.length"
                class="h-9 items-center xl:ml-6 xl:pl-6 xl:border-l border-ls-200 dark:border-ds-700" v-model="viewMode"
                :items="viewModes" />
        </div>
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

<script setup lang="ts" generic="T">
import Button from '@/components/basic/Button.vue';
import SwitchText from '@/components/basic/SwitchText.vue';

export type PageAction = {
    label?: string,
    icon?: string,
    disabled?: boolean,
    danger?: boolean,
    testID?: string,
    action: () => void,
};

export type PageViewMode<T> = {
    label: string,
    value: T,
};

defineProps<{
    title: string,
    caption?: string,
    actions?: PageAction[],
    viewModes?: PageViewMode<T>[],
}>();

const viewMode = defineModel<T>("viewMode", { required: false, });

</script>
