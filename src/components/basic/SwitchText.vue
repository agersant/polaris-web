<template>
    <div class="leading-7 flex gap-x-8 text-sm font-semibold">
        <div v-for="item of items" @click="onItemClicked(item)">
            <span class="cursor-pointer" :class="itemClass(item)">{{ item.label }}</span>
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
        return "text-accent-600";
    } else {
        return "text-ls-700";
    }
}

function onItemClicked(item: SwitchTextItem) {
    model.value = item.value;
}
</script>
