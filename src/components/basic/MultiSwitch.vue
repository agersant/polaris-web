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
        isSelected(item) ? "bg-accent-600 text-ls-0 ring-0 hover:bg-accent-500" : "bg-ls-0 text-ls-900 ring-1 ring-ls-300 hover:bg-ls-50",
    ];
}

function onItemClicked(item: MultiSwitchItem) {
    model.value = item.value;
}
</script>
