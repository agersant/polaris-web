<template>
    <div class="leading-7 flex gap-x-8 text-sm font-semibold">
        <div v-for="item of items" @click="onItemClicked(item)" class="cursor-pointer">
            <span v-text="item.label" :class="itemClass(item)" />
        </div>
    </div>
</template>

<script setup lang="ts">
export type SwitchTextItem = {
    label: string,
    value: any,
};

defineProps<{ items: SwitchTextItem[] }>();

const model = defineModel<any>({ required: true });

function isSelected(item: SwitchTextItem) {
    return item.value == model.value;
}

function itemClass(item: SwitchTextItem) {
    if (isSelected(item)) {
        return "text-accent-600 dark:text-accent-700";
    } else {
        return "text-ls-700 dark:text-ds-300";
    }
}

function onItemClicked(item: SwitchTextItem) {
    model.value = item.value;
}
</script>
