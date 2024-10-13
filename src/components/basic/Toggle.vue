<template>
    <SwitchGroup as="div" class="flex items-center"
        :class="[disabled ? 'cursor-not-allowed opacity-75 saturate-0' : '']">
        <Switch v-model="value" class="relative inline-flex h-6 w-11 flex-shrink-0
            rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-accent-600 focus:ring-offset-2" :class="[
                value ? 'bg-accent-600 dark:bg-accent-700' : 'bg-ls-200 dark:bg-ds-700',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            ]">
            <span
                :class="[value ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-ls-0 dark:bg-ds-0 shadow ring-0 transition duration-200 ease-in-out']">
                <span
                    :class="[value ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
                    aria-hidden="true">
                    <svg class="h-3 w-3 text-ls-400 dark:text-ds-600" fill="none" viewBox="0 0 12 12">
                        <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </span>
                <span
                    :class="[value ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']"
                    aria-hidden="true">
                    <svg class="h-3 w-3 text-accent-600 dark:text-accent-700" fill="currentColor" viewBox="0 0 12 12">
                        <path
                            d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                </span>
            </span>
        </Switch>
        <SwitchLabel v-if="label" as="span" class="ml-3 text-sm">
            <span class="font-medium text-ls-900 dark:text-ds-50" v-text="label" />
        </SwitchLabel>
    </SwitchGroup>
</template>

<script setup lang="ts">
import { Switch, SwitchGroup, SwitchLabel } from '@headlessui/vue';

const value = defineModel<boolean>({ required: true });

defineProps<{
    label?: string,
    disabled?: boolean,
}>();
</script>
