<template>
    <VirtualScroller :items="visibleNodes" :itemSize="38">
        <template v-slot:item="{ item, options }">
            <VirtualTreeNode style="height: 36px" :node="item" @node-toggle="onNodeToggle" @node-click="onNodeClick"
                :expanded="expandedKeys.has(item.key)" :selected="selectedKeys.has(item.key)" class="mb-0.5">
                <template #icon>
                    <slot name="icon" :node="item" />
                </template>
            </VirtualTreeNode>
        </template>
    </VirtualScroller>
</template>

<script setup lang="ts">
import VirtualScroller from 'primevue/virtualscroller';
import { computed, ref } from 'vue';

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

const visibleNodes = computed(() => {
    let nodes = [];
    let collapseDepth = Number.POSITIVE_INFINITY;
    for (const node of props.value) {
        if (node.depth >= collapseDepth) {
            continue;
        }
        nodes.push(node);
        if (!node.leaf && !expandedKeys.value.has(node.key)) {
            collapseDepth = node.depth + 1;
        } else {
            collapseDepth = Number.POSITIVE_INFINITY;
        }
    }
    return nodes;
});

const emit = defineEmits<{
    (e: 'node-expand', node: Node): void,
}>();

const expandedKeys = ref(new Set<string>());
const selectedKeys = ref(new Set<string>());

function onNodeToggle(node: Node) {
    const key = node.key;

    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
        emit('node-expand', node);
    }
}

function onNodeClick(event: MouseEvent, node: Node) {
    const key = node.key;

    if (selectedKeys.value.has(key)) {
        selectedKeys.value.delete(key);
    } else {
        selectedKeys.value.add(key);
    }
}

</script>
