<template>
    <VirtualScroller :items="props.value" :itemSize="38">
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
const selectedKeys = ref(new Set<string>());

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

function onNodeClick(event: MouseEvent, node: Node) {
    const key = node.key;

    if (selectedKeys.value.has(key)) {
        selectedKeys.value.delete(key);
    } else {
        selectedKeys.value.add(key);
    }
}

</script>
