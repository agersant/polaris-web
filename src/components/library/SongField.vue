<template>
    <div class="-mx-4 px-4 py-3 grid grid-cols-3 gap-4">
        <div v-text="label" class="font-medium text-sm text-ls-900 dark:text-ds-0" />
        <div class="col-span-2 text-sm leading-6 text-ls-700 dark:text-ds-400">
            <slot :values="values">
                <span v-for="(value, index) in values">
                    <span v-text="value.text" @click="onValueClicked(value)" :class="[
                        value.link ? 'cursor-pointer underline text-accent-600 dark:text-accent-700' : '',
                    ]" />
                    <span v-if="index < values.length - 1">,&nbsp;</span>
                </span>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

export interface FieldValue {
    text: string,
    link?: string,
};

defineProps<{
    label: string,
    values: FieldValue[],
}>();

function onValueClicked(value: FieldValue) {
    if (value.link) {
        router.push(value.link);
    }
}
</script>
