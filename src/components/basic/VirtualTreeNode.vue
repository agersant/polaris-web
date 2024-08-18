<template>
    <div @click="onClick" @dblclick="onDoubleClick" tabindex="0"
        class="group flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-ls-100 dark:hover:bg-ds-800"
        :class="rootClass" :style="rootStyle">
        <button type="button" @mousedown.prevent @click.stop="toggle" class="w-7 h-7 pt-1 flex flex-col"
            :class="{ invisible: node.leaf }" tabindex="-1">
            <template v-if="node.loading">
                <Spinner />
            </template>
            <template v-else>
                <span :class="iconClass" class="material-icons-round -mt-0.5">
                    {{ expanded ? "expand_more" : "chevron_right" }}
                </span>
            </template>
        </button>
        <span :class="iconClass" class="material-icons-round mr-2">{{ node.icon }}</span>
        <span class="text-nowrap">{{ props.node.label }}</span>
    </div>
</template>

<script setup lang="ts">
import { computed, StyleValue } from 'vue';

import Spinner from '@/components/basic/Spinner.vue';
import { Node } from "@/components/basic/VirtualTree.vue";

const props = defineProps<{
    node: Node,
    expanded: boolean,
    selected: boolean,
    focused: boolean,
}>();

const emit = defineEmits<{
    (e: 'node-toggle', node: Node): void,
    (e: 'node-click', originalEvent: MouseEvent, node: Node): void,
}>();

function toggle() {
    emit('node-toggle', props.node);
}

function onClick(event: MouseEvent) {
    emit('node-click', event, props.node);
}

function onDoubleClick(event: MouseEvent) {
    if (!props.node.leaf) {
        toggle();
    }
}

const rootClass = computed(() => {
    return [
        ...(props.selected ? ["!bg-accent-100", "text-accent-700", "dark:!bg-accent-900", "dark:text-accent-200"] : ["text-ls-700", "dark:text-ds-400", "dark:hover:text-ds-300"]),
        ...(props.focused ? ["outline-1", "-outline-offset-2", "outline-dotted", 'outline-accent-500'] : []),
    ];
});

const iconClass = computed(() => {
    return [
        ...(props.selected ? ["text-accent-700", "dark:text-accent-300"] : ["text-ls-400", "dark:text-ds-500", "dark:group-hover:text-ds-400"]),
    ];
});

const rootStyle = computed((): StyleValue => {
    return {
        "margin-left": `${16 * props.node.depth}px`,
    }
});

</script>