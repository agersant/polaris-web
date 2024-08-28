<template>
    <div class="flex" :class="[size == 'base' ? 'gap-3' : 'gap-2']">
        <div v-for="item of items" @click="onItemClicked(item)">
            <div class="flex flex-1 items-center justify-center rounded-md font-semibold uppercase"
                :class="itemClass(item)">
                <span class="material-icons-round">{{ item.icon }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
export type MultiSwitchItem = {
    icon: string,
    value: any,
    disabled?: boolean,
};

const props = withDefaults(defineProps<{
    items: MultiSwitchItem[],
    size?: "sm" | "base",
}>(), { size: "base" });

const model = defineModel<any>({ required: true });

function isSelected(item: MultiSwitchItem) {
    return item.value == model.value;
}

function itemClass(item: MultiSwitchItem) {
    if (item.disabled) {
        return;
    }

    return [
        props.size == "base" ? " p-3" : "p-1.5",
        item.disabled ? "cursor-not-allowed opacity-25" : "cursor-pointer",
        isSelected(item) ? "bg-accent-600 dark:bg-accent-700 text-ls-0 ring-0 hover:bg-accent-500 dark:hover:bg-accent-600" : "bg-ls-0 dark:bg-ds-700 text-ls-900 dark:text-ds-0 ring-1 ring-ls-300 dark:ring-0 hover:bg-ls-50 dark:hover:bg-ds-600",
    ];
}

function onItemClicked(item: MultiSwitchItem) {
    model.value = item.value;
}
</script>
