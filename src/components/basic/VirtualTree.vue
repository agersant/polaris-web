<template>
    <VirtualScroller :items="visibleNodes" :itemSize="38" class="select-none">
        <template v-slot:item="{ item, options }">
            <VirtualTreeNode style="height: 36px" :node="item" @node-toggle="onNodeToggle" @node-click="onNodeClick"
                @node-double-click="onNodeDoubleClick" :expanded="expandedKeys.has(item.key)"
                :selected="selectedKeys.has(item.key)" class="mb-0.5">
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

const emit = defineEmits<{
    (e: 'node-expand', node: Node): void,
}>();

const visibleKeys = computed(() => {
    let keys = new Set();
    let collapseDepth = Number.POSITIVE_INFINITY;
    for (const node of props.value) {
        if (node.depth >= collapseDepth) {
            continue;
        }
        keys.add(node.key);
        if (!node.leaf && !expandedKeys.value.has(node.key)) {
            collapseDepth = node.depth + 1;
        } else {
            collapseDepth = Number.POSITIVE_INFINITY;
        }
    }
    return keys;
});

const visibleNodes = computed(() => {
    let nodes = [];
    const visible = visibleKeys.value;
    for (const node of props.value) {
        if (visible.has(node.key)) {
            nodes.push(node);
        }
    }
    return nodes;
});

const expandedKeys = ref(new Set<string>());
const selectedKeys = ref(new Set<string>());
let pivot: string | undefined;

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

    const pivotIndex = props.value.findIndex(n => n.key == pivot);

    if (event.shiftKey && pivotIndex >= 0) {
        const clickedIndex = props.value.findIndex(n => n.key == key);
        const from = Math.min(pivotIndex, clickedIndex);
        const to = Math.max(pivotIndex, clickedIndex);

        if (event.ctrlKey) {
            for (let i = from; i <= to; i++) {
                const keyIter = props.value[i].key;
                if (!visibleKeys.value.has(keyIter)) {
                    continue;
                }
                selectedKeys.value.add(keyIter);
            }
        } else {
            selectedKeys.value.clear();
            for (let i = from; i <= to; i++) {
                const keyIter = props.value[i].key;
                if (!visibleKeys.value.has(keyIter)) {
                    continue;
                }
                if (selectedKeys.value.has(keyIter)) {
                    selectedKeys.value.delete(keyIter);
                } else {
                    selectedKeys.value.add(keyIter);
                }
            }
        }

    } else if (event.ctrlKey) {
        if (selectedKeys.value.has(key)) {
            selectedKeys.value.delete(key);
            pivot = undefined;
        } else {
            selectedKeys.value.add(key);
            pivot = key;
        }
    } else {
        selectedKeys.value.clear();
        selectedKeys.value.add(key);
        pivot = key;
    }

}

function onNodeDoubleClick(event: MouseEvent, node: Node) {
    if (!node.leaf) {
        onNodeToggle(node);
    }
}
</script>
