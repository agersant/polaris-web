<template>
    <div class="relative min-h-0">
        <div :list="visibleNodes" v-bind="containerProps" @keydown="onKeyDown" class="select-none h-full">
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

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, toRaw, watch } from 'vue';
import { useScroll, useVirtualList, watchDebounced } from '@vueuse/core';
import { vOnClickOutside } from "@vueuse/components";

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

const nodes = defineModel<Node[]>({ required: true });

const emit = defineEmits<{
    "node-expand": [node: Node],
    "nodes-drag-start": [event: DragEvent, nodes: Node[]],
    "nodes-drag": [event: DragEvent],
    "nodes-drag-end": [event: DragEvent],
}>();

const virtualList: Ref<HTMLElement | null> = ref(null);

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
const selectedKeys = ref(new Set<string>());
const focusedKey: Ref<string | undefined> = ref();
const pivotKey: Ref<string | undefined> = ref();

const selection = computed(() =>
    nodes.value.filter(n => selectedKeys.value.has(n.key))
);

defineExpose({ selection });

const overscan = 1;
const { list: virtualNodes, containerProps, wrapperProps, scrollTo } = useVirtualList(visibleNodes, { itemHeight: itemHeight.value, overscan: overscan });
const viewport = computed(() => containerProps.ref.value);
const { y: scrollY } = useScroll(viewport);

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
    pivotKey.value = node.key;
    focusedKey.value = node.key;
}

function onNodeClick(event: MouseEvent, node: Node) {

    focusedKey.value = node.key;

    const pivotIndex = nodes.value.findIndex(n => n.key == pivotKey.value);

    if (event.shiftKey && pivotIndex >= 0) {
        const clickedIndex = nodes.value.findIndex(n => n.key == node.key);
        const from = Math.min(pivotIndex, clickedIndex);
        const to = Math.max(pivotIndex, clickedIndex);

        if (event.ctrlKey) {
            for (let i = from; i <= to; i++) {
                const keyIter = nodes.value[i].key;
                if (!visibleKeys.value.has(keyIter)) {
                    continue;
                }
                selectedKeys.value.add(keyIter);
            }
        } else {
            selectedKeys.value.clear();
            for (let i = from; i <= to; i++) {
                const keyIter = nodes.value[i].key;
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
            pivotKey.value = undefined;
        } else {
            selectedKeys.value.add(node.key);
            pivotKey.value = node.key;
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

    const isPrintable = event.key.length == 1 && !event.ctrlKey;
    if (isPrintable) {
        findQuery.value += event.key;
        event.preventDefault();
        return;
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
        case 'ArrowUp':
            move(-1, event);
            event.preventDefault();
            break;
        case 'ArrowDown':
            move(1, event);
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
        case 'End':
            move(Number.POSITIVE_INFINITY, event);
            snapScrolling();
            event.preventDefault();
            break;
        case 'Enter':
            if (findQuery.value.length) {
                event.stopImmediatePropagation();
            }
            event.preventDefault();
            break;
        case 'Escape':
            if (!findQuery.value.length) {
                selectedKeys.value.clear();
                focusedKey.value = undefined;
                pivotKey.value = undefined;
            }
            break;
        case 'Home':
            move(Number.NEGATIVE_INFINITY, event);
            event.preventDefault();
            break;
        case 'KeyA':
            if (event.ctrlKey) {
                selectedKeys.value = new Set(visibleKeys.value);
                focusedKey.value = nodes.value.find(n => visibleKeys.value.has(n.key))?.key;
                pivotKey.value = focusedKey.value;
            }
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
                selectedKeys.value.clear();
                selectedKeys.value.add(priorNode.key);
                pivotKey.value = priorNode.key;
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

    const pivotIndex = visibleNodes.value.findIndex(n => n.key == pivotKey.value);
    const fromIndex = Math.max(0, Math.min(visibleNodes.value.findIndex(n => n.key == focusedKey.value), visibleNodes.value.length - 1));
    const toIndex = Math.max(0, Math.min(fromIndex + delta, visibleNodes.value.length - 1));
    const toNode = visibleNodes.value[toIndex];

    if (!event.shiftKey || pivotIndex < 0) {
        selectedKeys.value.clear();
        selectedKeys.value.add(toNode.key);
        pivotKey.value = toNode.key;
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

const historyStateKey = "virtualTreeState";

// Ideally we would only save state when vue-router calls `onBeforeRouteLeave`
// However, when the user clicks the browser back button, the browser
// history updates before vue-router's. When `onBeforeRouteLeave` runs, it
// is too late to save data for the page we are exiting via `history.replaceState()`.
watchDebounced([nodes, expandedKeys, selectedKeys, focusedKey, pivotKey, scrollY], () => {
    const state = {
        nodes: nodes.value,
        expandedKeys: toRaw(expandedKeys.value),
        selectedKeys: toRaw(selectedKeys.value),
        focusedKey: focusedKey.value,
        pivotKey: pivotKey.value,
        scrollY: scrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { debounce: 100, maxWait: 500 });

onMounted(() => {
    const state = history.state[historyStateKey];
    if (!state) {
        return;
    }
    nodes.value = state.nodes;
    expandedKeys.value = state.expandedKeys;
    selectedKeys.value = state.selectedKeys;
    focusedKey.value = state.focusedKey;
    pivotKey.value = state.pivotKey;
    nextTick(() => {
        viewport.value?.scrollTo({ top: state.scrollY });
    });
});

</script>
