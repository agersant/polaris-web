<template>
    <div @click="onClick"
        class="flex items-center px-2 py-1 mb-0.5 rounded-md cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
        :class="{ '!bg-highlight': selected }" :style="rootStyle">
        <button type="button" @click.stop="toggle" class="w-7 h-7 pt-1" :class="{ invisible: node.leaf }" tabindex="-1">
            <template v-if="node.loading">
                <SpinnerIcon spin />
            </template>
            <template v-else>
                <ChevronDownIcon v-if="expanded" />
                <ChevronRightIcon v-else />
            </template>
        </button>
        <slot name="icon" />
        <span class="text-nowrap" :style="labelStyle">{{ props.node.label }}</span>
    </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@primevue/icons/chevrondown';
import ChevronRightIcon from '@primevue/icons/chevronright';
import SpinnerIcon from '@primevue/icons/spinner';
import { computed, StyleValue } from 'vue';

import { Node } from "@/components/basic/VirtualTree.vue";
import { $dt } from '@primevue/themes';

const props = defineProps<{
    node: Node,
    expanded: boolean,
    selected: boolean,
}>();

const emit = defineEmits<{
    (e: 'node-toggle', node: Node): void,
    (e: 'node-click', originalEvent: MouseEvent, node: Node): void,
}>();

function toggle() {
    emit('node-toggle', props.node);
}

function onClick(event: MouseEvent) {
    console.log($dt("highlight.color"));
    emit('node-click', event, props.node);
}

const rootStyle = computed((): StyleValue => {
    return {
        "margin-left": `${16 * props.node.depth}px`,
        "color": $dt(props.selected ? "highlight.color" : "text.muted.color").variable,
    }
});

const labelStyle = computed((): StyleValue => {
    return {
        "color": $dt(props.selected ? "highlight.color" : "text.color").variable,
    }
});

</script>