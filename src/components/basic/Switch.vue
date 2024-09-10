<template>
    <div class="flex gap-2">
        <div v-for="item of items" @click="onItemClicked(item)">
            <div class="flex flex-1 p-1.5 items-center justify-center rounded-md font-semibold"
                :class="itemClass(item)">
                <span v-text="item.icon" class="material-icons-round" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
export type SwitchItem = {
    icon: string,
    value: any,
    disabled?: boolean,
};

defineProps<{ items: SwitchItem[] }>();

const model = defineModel<any>({ required: true });

function isSelected(item: SwitchItem) {
    return item.value == model.value;
}

function itemClass(item: SwitchItem) {
    if (item.disabled) {
        return;
    }

    return [
        item.disabled ? "cursor-not-allowed opacity-25" : "cursor-pointer",
        isSelected(item) ? "bg-accent-600 dark:bg-accent-700 text-ls-0 ring-0 hover:bg-accent-500 dark:hover:bg-accent-600" : "bg-ls-0 dark:bg-ds-700 text-ls-900 dark:text-ds-0 ring-1 ring-ls-300 dark:ring-0 hover:bg-ls-50 dark:hover:bg-ds-600",
    ];
}

function onItemClicked(item: SwitchItem) {
    model.value = item.value;
}
</script>
