<template>
    <VirtualScroller :items="props.value" :itemSize="40">
        <template v-slot:item="{ item, options }">
            <VirtualTreeNode style="height: 40px" :node="item" @node-toggle="onNodeToggle"
                :expanded="expandedKeys.has(item.key)">
                <template #icon>
                    <slot name="icon" :node="item" />
                </template>
            </VirtualTreeNode>
        </template>
    </VirtualScroller>
</template>

<script setup lang="ts">
import VirtualScroller from 'primevue/virtualscroller';
import { ref } from 'vue';

import VirtualTreeNode from "./VirtualTreeNode.vue";

export interface Node {
    depth: number,
    key: string,
    label: string,
    icon?: string,
    leaf: boolean,
    loading?: boolean,
}

const props = defineProps<{
    value: Node[],
}>();

const emit = defineEmits<{
    (e: 'node-collapse', node: Node): void,
    (e: 'node-expand', node: Node): void,
}>();

const expandedKeys = ref(new Set<string>());

function onNodeToggle(node: Node) {
    const key = node.key;

    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
        emit('node-collapse', node);
    } else {
        expandedKeys.value.add(key);
        emit('node-expand', node);
    }
}

</script>
