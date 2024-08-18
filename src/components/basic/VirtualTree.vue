<template>
    <VirtualScroller ref="virtualScroller" :items="visibleNodes" :itemSize="38" @keydown.prevent="onKeyDown"
        class="select-none">
        <template v-slot:item="{ item, options }">
            <VirtualTreeNode style="height: 36px" :node="item" @node-toggle="toggleNode" @node-click="onNodeClick"
                @move-up="moveUp" @move-down="moveDown" @move-left="moveLeft" @move-right="moveRight"
                :expanded="expandedKeys.has(item.key)" :focused="focusedKey == item.key"
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
import { computed, Ref, ref } from 'vue';

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

const virtualScroller: Ref<InstanceType<typeof VirtualScroller> | null> = ref(null);

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

function toggleNode(node: Node) {
    const key = node.key;

    if (expandedKeys.value.has(key)) {
        expandedKeys.value.delete(key);
    } else {
        expandedKeys.value.add(key);
        emit('node-expand', node);
    }

    virtualScroller.value?.$el.focus();
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
        selectedKeys.value.clear();
        selectedKeys.value.add(node.key);
        pivotKey = node.key;
    }

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
            moveUp(event);
            break;
        case 'ArrowDown':
            moveDown(event);
            break;
        default:
            break;
    }
}

function moveUp(event: KeyboardEvent) {
    move(-1, event);
}

function moveDown(event: KeyboardEvent) {
    move(1, event);
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
        moveDown(event);
    } else {
        toggleNode(focusedNode);
    }
}

function move(delta: number, event: KeyboardEvent) {
    const fromIndex = Math.max(0, Math.min(visibleNodes.value.findIndex(n => n.key == focusedKey.value), visibleNodes.value.length - 1));
    const toIndex = Math.max(0, Math.min(fromIndex + delta, visibleNodes.value.length - 1));
    const toNode = visibleNodes.value[toIndex];

    if (!event.shiftKey) {
        selectedKeys.value.clear();
        selectedKeys.value.add(toNode.key);
    } else {
        // TODO add a node if moving away from pivot, remove a node when moving towards pivot
    }

    if (virtualScroller.value) {
        const padding = 4;
        const { first, last, viewport } = virtualScroller.value.getRenderedRange();
        console.log(toIndex, viewport);
        if (delta < 0 && toIndex < viewport.first + padding) {
            console.log(first, last, viewport, toIndex - padding);
            virtualScroller.value.scrollInView(toIndex - padding, "to-start", "instant");
        }
        if (delta > 0 && toIndex > viewport.last - padding) {
            virtualScroller.value.scrollInView(toIndex + padding, "to-end", "instant");
        }
    }

    focusedKey.value = toNode.key;
}

</script>
