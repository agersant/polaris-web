<template>
    <div class="relative min-h-0">
        <div :list="visibleNodes" v-bind="containerProps" @keydown="onKeyDown" class="h-full">
            <div v-bind="wrapperProps" ref="virtualList" tabindex="-1" class="outline-none">
                <VirtualTreeNode v-for="node in virtualNodes" :style="`height: ${itemHeight}px`" :node="node.data"
                    tabindex="-1" @node-toggle="toggleNode" @click="clickNode($event, node.data)"
                    @dblclick="onNodeDoubleClick($event, node.data)" draggable="true"
                    @dragstart="onDragStart($event, node.data)" @drag="onDrag($event)" @dragend="onDragEnd($event)"
                    :expanded="expandedKeys.has(node.data.key)" :focused="focusedKey == node.data.key"
                    :selected="selectedKeys.has(node.data.key)">
                </VirtualTreeNode>
            </div>
        </div>
        <div v-if="findQuery.length" class="absolute right-0 bottom-0" v-on-click-outside="clearFindQuery">
            <div class="relative text-ls-900 dark:text-ds-400">
                <label
                    class="absolute -top-2 left-2 rounded-sm bg-ls-50 dark:bg-ds-900 px-1 text-xs font-medium">Find</label>
                <input disabled type="text" :value="findQuery"
                    class="rounded-md dark:bg-ds-900 border-0 py-2 shadow-sm ring-2 ring-inset ring-accent-600"
                    :class="findQuery.length && !findMatch ? 'ring-red-600 text-red-900 dark:text-red-400' : ''" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends Node">
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useVirtualList } from '@vueuse/core';
import { vOnClickOutside } from "@vueuse/components";

import VirtualTreeNode from "@/components/basic/VirtualTreeNode.vue";
import { saveScrollState, useHistory } from '@/history';
import useMultiselect from '@/multiselect';

export interface Node {
    depth: number,
    key: string,
    label: string,
    icon?: string,
    leaf: boolean,
    loading?: boolean,
}

const itemHeight = ref(36);

const nodes = defineModel<T[]>({ required: true });

const props = defineProps<{ id?: string }>();

const emit = defineEmits<{
    "node-expand": [node: T],
    "node-double-click": [node: T],
    "nodes-drag-start": [event: DragEvent, nodes: T[]],
    "nodes-drag": [event: DragEvent],
    "nodes-drag-end": [event: DragEvent],
}>();

const virtualList = useTemplateRef("virtualList");

const visibleKeys = computed(() => {
    let keys = new Set<string>();
    let collapseDepth = Number.POSITIVE_INFINITY;
    for (const node of nodes.value) {
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
    let visible = [];
    const keys = visibleKeys.value;
    for (const node of nodes.value) {
        if (keys.has(node.key)) {
            visible.push(node);
        }
    }
    return visible;
});

const expandedKeys = ref(new Set<string>());

const { clickItem: clickNode, focusedKey, multiselect, pivotKey, selectedKeys, selection, selectItem: selectNode } = useMultiselect<T>(
    visibleNodes,
    { onMove: snapScrolling },
);

defineExpose({ selection });

const overscan = 1;
const { list: virtualNodes, containerProps, wrapperProps, scrollTo } = useVirtualList(visibleNodes, { itemHeight: itemHeight.value, overscan });
const viewport = computed(() => containerProps.ref.value);

const findQuery = ref("");
const findMatch = computed(() => {
    if (!findQuery.value.length) {
        return undefined;
    }
    let lowercaseQuery = findQuery.value.toLowerCase();
    const visible = visibleKeys.value;
    return nodes.value.find(n => visible.has(n.key) && n.label.toLowerCase().startsWith(lowercaseQuery));
});
watch(findMatch, () => {
    if (findMatch.value) {
        selectNode(findMatch.value);
        snapScrolling();
    }
});

function clearFindQuery() {
    findQuery.value = "";
}

function toggleNode(node: T) {
    const key = node.key;

    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
        emit('node-expand', node);
    }

    virtualList.value?.focus();
}

function onNodeDoubleClick(event: MouseEvent, node: T) {
    if (!node.leaf) {
        toggleNode(node);
    }
    emit("node-double-click", node);
}

function onDragStart(event: DragEvent, node: T) {
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

    const isPrintable = event.key.length == 1 && !event.ctrlKey;
    if (isPrintable) {
        findQuery.value += event.key;
        event.preventDefault();
        return;
    }

    if (event.code != "Escape" || !findQuery.value.length) {
        multiselect.onKeyDown(event);
    }

    let preserveFindQuery = false;
    switch (event.code) {
        case 'AltLeft':
        case 'AltRight':
            preserveFindQuery = true;
            break;
        case 'ArrowLeft':
            moveLeft(event);
            event.preventDefault();
            break;
        case 'ArrowRight':
            moveRight(event);
            event.preventDefault();
            break;
        case 'Backspace':
            findQuery.value = findQuery.value.slice(0, -1);
            preserveFindQuery = true;
            event.preventDefault();
            break;
        case 'ControlLeft':
        case 'ControlRight':
            preserveFindQuery = true;
            break;
        case 'Enter':
            if (findQuery.value.length) {
                event.stopImmediatePropagation();
            }
            event.preventDefault();
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            preserveFindQuery = true;
            break;
        default:
            break;
    }

    if (!preserveFindQuery) {
        findQuery.value = "";
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
                selectNode(priorNode);
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
        multiselect.move(event, 1);
    } else {
        toggleNode(focusedNode);
    }
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

    if (focusedIndex <= first + padding) {
        scrollTo(Math.max(0, focusedIndex - padding));
    } else if (focusedIndex >= last - padding) {
        scrollTo(focusedIndex - (last - first) + padding);
    }
}

useHistory(`virtual-tree-${props.id || 'default'}`, [nodes, expandedKeys, selectedKeys, focusedKey, pivotKey, saveScrollState(viewport)]);

</script>
