<template>
    <div :list="visibleNodes" v-bind="containerProps" @keydown="onKeyDown" class="select-none">
        <div v-bind="wrapperProps" ref="virtualList" tabindex="-1" class="outline-none">
            <VirtualTreeNode v-for="node in virtualNodes" :style="`height: ${itemHeight}px`" :node="node.data"
                tabindex="-1" @node-toggle="toggleNode" @click="onNodeClick($event, node.data)"
                @dblclick="onNodeDoubleClick($event, node.data)" draggable="true"
                @dragstart="onDragStart($event, node.data)" @drag="onDrag($event)" @dragend="onDragEnd($event)"
                :expanded="expandedKeys.has(node.data.key)" :focused="focusedKey == node.data.key"
                :selected="selectedKeys.has(node.data.key)">
            </VirtualTreeNode>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from 'vue';
import { useVirtualList } from '@vueuse/core';

import VirtualTreeNode from "./VirtualTreeNode.vue";

export interface Node {
    depth: number,
    key: string,
    label: string,
    icon?: string,
    leaf: boolean,
    loading?: boolean,
}

const itemHeight = ref(36);

const props = defineProps<{
    value: Node[],
}>();

const emit = defineEmits<{
    'node-expand': [node: Node],
    'nodes-drag-start': [event: DragEvent, nodes: Node[]],
    'nodes-drag': [event: DragEvent],
    'nodes-drag-end': [event: DragEvent],
}>();

const virtualList: Ref<HTMLElement | null> = ref(null);

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
const focusedKey: Ref<string | undefined> = ref();
let pivotKey: string | undefined;

const selection = computed(() =>
    props.value.filter(n => selectedKeys.value.has(n.key))
);

defineExpose({ selection });

const overscan = 1;
const { list: virtualNodes, containerProps, wrapperProps, scrollTo } = useVirtualList(visibleNodes, { itemHeight: itemHeight.value, overscan: overscan });

function toggleNode(node: Node) {
    const key = node.key;

    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
        emit('node-expand', node);
    }

    virtualList.value?.focus();
}

function selectNode(node: Node) {
    selectedKeys.value.clear();
    selectedKeys.value.add(node.key);
    pivotKey = node.key;
    focusedKey.value = node.key;
}

function onNodeClick(event: MouseEvent, node: Node) {

    focusedKey.value = node.key;

    const pivotIndex = props.value.findIndex(n => n.key == pivotKey);

    if (event.shiftKey && pivotIndex >= 0) {
        const clickedIndex = props.value.findIndex(n => n.key == node.key);
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
        if (selectedKeys.value.has(node.key)) {
            selectedKeys.value.delete(node.key);
            pivotKey = undefined;
        } else {
            selectedKeys.value.add(node.key);
            pivotKey = node.key;
        }
    } else {
        selectNode(node);
    }

}

function onNodeDoubleClick(event: MouseEvent, node: Node) {
    if (!node.leaf) {
        toggleNode(node);
    }
}

function onDragStart(event: DragEvent, node: Node) {
    if (!selectedKeys.value.has(node.key)) {
        selectNode(node);
    }
    emit('nodes-drag-start', event, selection.value);
}

function onDrag(event: DragEvent) {
    emit('nodes-drag', event);
}

function onDragEnd(event: DragEvent) {
    emit('nodes-drag-end', event);
}

function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
        case 'ArrowLeft':
            moveLeft(event);
            break;
        case 'ArrowRight':
            moveRight(event);
            break;
        case 'ArrowUp':
            move(-1, event);
            event.preventDefault();
            break;
        case 'ArrowDown':
            move(1, event);
            event.preventDefault();
            break;
        case 'PageUp':
            move(-10, event);
            event.preventDefault();
            break;
        case 'PageDown':
            move(10, event);
            event.preventDefault();
            break;
        case 'Home':
            move(Number.NEGATIVE_INFINITY, event);
            event.preventDefault();
            break;
        case 'End':
            move(Number.POSITIVE_INFINITY, event);
            snapScrolling();
            event.preventDefault();
            break;
        case 'Escape':
            selectedKeys.value.clear();
            focusedKey.value = undefined;
            pivotKey = undefined;
            break;
        // TODO Ctrl+A to select all
        default:
            break;
    }
}

function moveLeft(event: KeyboardEvent) {
    const focusedIndex = visibleNodes.value.findIndex(n => n.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    const focusedNode = visibleNodes.value[focusedIndex];

    if (!focusedNode.leaf && expandedKeys.value.has(focusedNode.key)) {
        toggleNode(focusedNode);
    } else {
        for (let i = focusedIndex - 1; i >= 0; i--) {
            const priorNode = visibleNodes.value[i];
            if (priorNode.depth < focusedNode.depth) {
                selectedKeys.value.clear();
                selectedKeys.value.add(priorNode.key);
                pivotKey = priorNode.key;
                focusedKey.value = priorNode.key;
                snapScrolling();
                break;
            }
        }
    }
}

function moveRight(event: KeyboardEvent) {
    const focusedNode = visibleNodes.value.find(n => n.key == focusedKey.value);
    if (!focusedNode) {
        return;
    }

    if (focusedNode.leaf || focusedNode.loading) {
        return;
    } else if (expandedKeys.value.has(focusedNode.key)) {
        move(1, event);
    } else {
        toggleNode(focusedNode);
    }
}

function move(delta: number, event: KeyboardEvent) {
    if (delta == 0) {
        return;
    }

    const pivotIndex = visibleNodes.value.findIndex(n => n.key == pivotKey);
    const fromIndex = Math.max(0, Math.min(visibleNodes.value.findIndex(n => n.key == focusedKey.value), visibleNodes.value.length - 1));
    const toIndex = Math.max(0, Math.min(fromIndex + delta, visibleNodes.value.length - 1));
    const toNode = visibleNodes.value[toIndex];

    if (!event.shiftKey || pivotIndex < 0) {
        selectedKeys.value.clear();
        selectedKeys.value.add(toNode.key);
        pivotKey = toNode.key;
    } else {
        for (let index = fromIndex; true; index += Math.sign(delta)) {
            if ((delta > 0 && index > pivotIndex) || (delta < 0 && index < pivotIndex)) {
                selectedKeys.value.add(visibleNodes.value[index].key);
            } else if (index != pivotIndex && index != toIndex) {
                selectedKeys.value.delete(visibleNodes.value[index].key);
            }
            if (index == toIndex) {
                break;
            }
        }
    }

    focusedKey.value = toNode.key;
    snapScrolling();
}

function snapScrolling() {
    const focusedIndex = visibleNodes.value.findIndex(n => n.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    const padding = 4 + overscan;
    const nodes = virtualNodes.value;
    const first = nodes[0].index;
    const last = nodes[nodes.length - 1].index;

    if (focusedIndex < first + padding) {
        scrollTo(focusedIndex - padding);
    } else if (focusedIndex > last - padding) {
        scrollTo(focusedIndex - (last - first) + padding);
    }
}

</script>
