<template>
    <div ref="container" class="overflow-y-scroll overflow-x-hidden" tabindex="-1" @keydown="onKeyDown">
        <div ref="wrapper" class="relative" :style="{ height: `${props.items.length * props.itemHeight}px` }">
            <TransitionGroup name="list">
                <div v-for="item, index of virtualItems" @click="e => onItemClick(e, item)" :draggable="true"
                    @dragstart="e => onDragStart(item)" @dragend="onDragEnd"
                    class="absolute transition-all ease-out duration-100" :key="item.key"
                    :style="{ translate: `0 ${(firstVirtualIndex + index) * itemHeight}px` }">

                    <slot :item="item" :selected="selectedKeys.has(item.key)">
                        <div class="whitespace-nowrap select-none"
                            :class="{ 'bg-accent-500': selectedKeys.has(item.key) }"
                            :style="{ height: itemHeight + 'px' }">
                            {{ item }}
                        </div>
                    </slot>

                </div>
            </TransitionGroup>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends { key: string | number }">
import { computed, Ref, ref, watch } from 'vue';
import { useElementSize, useMouseInElement, useScroll } from '@vueuse/core';

const props = defineProps<{
    items: T[],
    itemHeight: number,
}>();

const emit = defineEmits<{
    'reorder': [items: T[], toIndex: number]
}>();

const container: Ref<HTMLElement | null> = ref(null);
const wrapper: Ref<HTMLElement | null> = ref(null);

const { height: containerHeight } = useElementSize(container);
const { y: scrollY } = useScroll(container);

const selectedKeys: Ref<Set<string | number>> = ref(new Set());
const focusedKey: Ref<string | number | undefined> = ref();
let pivotKey: string | number | undefined;

const selection = computed(() =>
    props.items.filter(item => selectedKeys.value.has(item.key))
);

defineExpose({ selection });

const firstVirtualIndex = computed(() => {
    return Math.floor(scrollY.value / props.itemHeight);
});

const numVirtualItems = computed(() => {
    return 1 + Math.ceil(containerHeight.value / props.itemHeight);
});

const dragInProgress = ref(false);
const { elementY: mouseY, isOutside } = useMouseInElement(wrapper);
const dropIndex: Ref<number | undefined> = ref(undefined);
watch([mouseY, props.itemHeight, props.items], () => {
    if (isOutside.value || !dragInProgress.value) {
        return;
    }
    dropIndex.value = Math.max(0, Math.min(Math.floor(mouseY.value / props.itemHeight), props.items.length - 1));
});

const orderedItems = computed(() => {
    if (!dragInProgress.value || dropIndex.value == undefined) {
        return props.items;
    }

    let reordered: T[] = [];
    let insertLocation = props.items.length - selectedKeys.value.size;

    for (let i = 0; i < props.items.length; i++) {
        if (reordered.length == dropIndex.value) {
            insertLocation = reordered.length;
        }
        if (!selectedKeys.value.has(props.items[i].key)) {
            reordered.push(props.items[i]);
        }
    }

    reordered.splice(insertLocation, 0, ...selection.value);

    return reordered;
});

const virtualItems = computed(() => {
    return orderedItems.value.slice(firstVirtualIndex.value, firstVirtualIndex.value + numVirtualItems.value);
});

function selectItem(item: T) {
    selectedKeys.value.clear();
    selectedKeys.value.add(item.key);
    pivotKey = item.key;
    focusedKey.value = item.key;
}

function onDragStart(item: T) {
    dragInProgress.value = true;
    if (!selectedKeys.value.has(item.key)) {
        selectItem(item);
    }
}

function onDragEnd() {
    dragInProgress.value = false;
    if (dropIndex.value != undefined) {
        emit('reorder', selection.value, dropIndex.value);
    }
}

function onItemClick(event: MouseEvent, item: T) {

    focusedKey.value = item.key;

    const pivotIndex = pivotKey ? props.items.findIndex(i => i.key == pivotKey) : -1;

    if (event.shiftKey && pivotIndex >= 0) {
        const clickedIndex = props.items.indexOf(item);
        const from = Math.min(pivotIndex, clickedIndex);
        const to = Math.max(pivotIndex, clickedIndex);

        if (event.ctrlKey) {
            for (let i = from; i <= to; i++) {
                const keyIter = props.items[i].key;
                selectedKeys.value.add(keyIter);
            }
        } else {
            selectedKeys.value.clear();
            for (let i = from; i <= to; i++) {
                const keyIter = props.items[i].key;
                if (selectedKeys.value.has(keyIter)) {
                    selectedKeys.value.delete(keyIter);
                } else {
                    selectedKeys.value.add(keyIter);
                }
            }
        }

    } else if (event.ctrlKey) {
        if (selectedKeys.value.has(item.key)) {
            selectedKeys.value.delete(item.key);
            pivotKey = undefined;
        } else {
            selectedKeys.value.add(item.key);
            pivotKey = item.key;
        }
    } else {
        selectItem(item);
    }

}

function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
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
            break;
        case 'End':
            move(Number.POSITIVE_INFINITY, event);
            snapScrolling();
            break;
        case 'Escape':
            selectedKeys.value.clear();
            focusedKey.value = undefined;
            pivotKey = undefined;
            break;
        default:
            break;
    }
}

function move(delta: number, event: KeyboardEvent) {
    if (delta == 0) {
        return;
    }

    const pivotIndex = props.items.findIndex(i => i.key == pivotKey);
    const fromIndex = Math.max(0, Math.min(props.items.findIndex(item => item.key == focusedKey.value), props.items.length - 1));
    const toIndex = Math.max(0, Math.min(fromIndex + delta, props.items.length - 1));
    const toItem = props.items[toIndex];

    if (!event.shiftKey || pivotIndex < 0) {
        selectedKeys.value.clear();
        selectedKeys.value.add(toItem.key);
        pivotKey = toItem.key;
    } else {
        for (let index = fromIndex; true; index += Math.sign(delta)) {
            if ((delta > 0 && index > pivotIndex) || (delta < 0 && index < pivotIndex)) {
                selectedKeys.value.add(props.items[index].key);
            } else if (index != pivotIndex) {
                selectedKeys.value.delete(props.items[index].key);
            }
            if (index == toIndex) {
                break;
            }
        }
    }

    focusedKey.value = toItem.key;
    snapScrolling();
}

function snapScrolling() {
    const focusedIndex = props.items.findIndex(i => i.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    // const padding = 4 + overscan;
    // const items = virtualItems.value;
    // const first = items[0].index;
    // const last = items[items.length - 1].index;

    // if (focusedIndex < first + padding) {
    //     scrollTo(focusedIndex - padding);
    // } else if (focusedIndex > last - padding) {
    //     scrollTo(focusedIndex - (last - first) + padding);
    // }
}

</script>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: none 0s linear;
}
</style>