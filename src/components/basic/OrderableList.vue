<template>
    <div ref="container" class="overflow-y-scroll overflow-x-hidden" tabindex="-1" @keydown="onKeyDown"
        @dragenter.prevent @dragover.prevent @drop="onDrop">
        <div ref="wrapper" class="relative min-h-full"
            :style="{ height: `${props.items.length * props.itemHeight}px` }">
            <TransitionGroup :name="isReordering ? 'reorder' : 'drop'">
                <div v-for="item, index of virtualItems" @click="e => onItemClick(e, item)" :key="item.key"
                    :draggable="true" @dragstart="e => onDragStart(e, item)" @dragend="onDragEnd"
                    class="absolute w-full "
                    :style="{ translate: `0 ${(firstVirtualIndex + index) * itemHeight}px`, height: `${itemHeight}px` }">

                    <slot name="drop-preview" v-if="item.isDropPreview">
                        <div :style="{ height: itemHeight + 'px' }">Drop Preview</div>
                    </slot>

                    <slot name="default" v-else :item="item" :selected="selectedKeys.has(item.key)">
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
import { useElementSize, useMouseInElement, useRafFn, useScroll } from '@vueuse/core';

const props = defineProps<{
    items: T[],
    itemHeight: number,
    showDropPreview: boolean,
}>();

const emit = defineEmits<{
    'list-drop': [toIndex: number]
    'list-reorder': [items: T[], toIndex: number]
}>();

const container: Ref<HTMLElement | null> = ref(null);
const wrapper: Ref<HTMLElement | null> = ref(null);

const blankImage = new Image(0, 0);
blankImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

const { height: containerHeight } = useElementSize(container);
const { y: scrollY } = useScroll(container);
const { elementY: containerMouseY, isOutside } = useMouseInElement(container);
const { elementY: wrapperMouseY } = useMouseInElement(wrapper);

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

const isReordering = ref(false);
const dropIndex: Ref<number | undefined> = ref(undefined);
watch([wrapperMouseY], () => {
    if (isOutside.value) {
        return;
    }

    if (!isReordering.value && !props.showDropPreview) {
        return;
    }

    const max = isReordering.value ? props.items.length - 1 : props.items.length;
    dropIndex.value = Math.max(0, Math.min(Math.round(wrapperMouseY.value / props.itemHeight), max));
});

const orderedItems = computed(() => {
    if (!isReordering.value || dropIndex.value == undefined) {
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
    let items: (T & { isDropPreview: boolean })[] = orderedItems.value.slice(firstVirtualIndex.value, firstVirtualIndex.value + numVirtualItems.value)
        .map(i => { return { ...i, isDropPreview: false } });

    const first = firstVirtualIndex.value;
    const last = firstVirtualIndex.value + numVirtualItems.value - 1;
    if (props.showDropPreview && !isOutside.value && dropIndex.value != undefined && dropIndex.value >= first && dropIndex.value <= last) {
        items.splice(dropIndex.value - first, 0, { ...items[0], key: -1, isDropPreview: true })
    }

    return items;
});

function selectItem(item: T) {
    selectedKeys.value.clear();
    selectedKeys.value.add(item.key);
    pivotKey = item.key;
    focusedKey.value = item.key;
}

function onDragStart(event: DragEvent, item: T) {
    isReordering.value = true;
    event.dataTransfer?.setDragImage(blankImage, 0, 0);
    if (!selectedKeys.value.has(item.key)) {
        selectItem(item);
    }
}

function onDragEnd() {
    isReordering.value = false;
    if (dropIndex.value != undefined) {
        emit('list-reorder', selection.value, dropIndex.value);
    }
}

function onDrop() {
    emit('list-drop', dropIndex.value || 0);
}

function onItemClick(event: MouseEvent, item: T) {

    focusedKey.value = item.key;

    const pivotIndex = pivotKey ? props.items.findIndex(i => i.key == pivotKey) : -1;

    if (event.shiftKey && pivotIndex >= 0) {
        const clickedIndex = props.items.findIndex(i => i.key == item.key);
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
            event.preventDefault();
            break;
        case 'End':
            move(Number.POSITIVE_INFINITY, event);
            event.preventDefault();
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
            } else if (index != pivotIndex && index != toIndex) {
                selectedKeys.value.delete(props.items[index].key);
            }
            if (index == toIndex) {
                break;
            }
        }
    }

    focusedKey.value = toItem.key;
    const focusedIndex = props.items.findIndex(i => i.key == focusedKey.value);
    snapScrolling(focusedIndex);
}

function snapScrolling(index: number) {
    const focusedIndex = props.items.findIndex(i => i.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    const padding = 4;
    const first = firstVirtualIndex.value;
    const last = first + virtualItems.value.length - 1;

    if (focusedIndex < first + padding) {
        container.value?.scrollTo(0, props.itemHeight * (focusedIndex - padding));
    } else if (focusedIndex > last - padding) {
        container.value?.scrollTo(0, props.itemHeight * (focusedIndex - (last - first) + padding));
    }
}

function remap(value: number, fromA: number, fromB: number, toA: number, toB: number) {
    return toA + (toB - toA) * Math.max(0, Math.min((value - fromA) / (fromB - fromA), 1));
}

useRafFn(({ delta }) => {
    if (isOutside.value || !wrapper.value || !container.value) {
        return;
    }

    if (!isReordering.value && !props.showDropPreview) {
        return;
    }

    const triggerRange = 0.05;
    const maxTracksPerSecond = 80;
    const viewportHeight = container.value.clientHeight;

    if (containerMouseY.value < viewportHeight * triggerRange) {
        const tracksPerSecond = remap(
            containerMouseY.value,
            0,
            viewportHeight * triggerRange,
            -maxTracksPerSecond, 0
        );
        container.value.scrollBy({
            behavior: "instant",
            top: Math.ceil(tracksPerSecond * props.itemHeight * delta / 1000)
        });
    } else if (containerMouseY.value > viewportHeight * (1 - triggerRange)) {
        const tracksPerSecond = remap(
            containerMouseY.value,
            viewportHeight * (1 - triggerRange),
            viewportHeight,
            0, maxTracksPerSecond
        );
        container.value.scrollBy({
            behavior: "instant",
            top: Math.ceil(tracksPerSecond * props.itemHeight * delta / 1000)
        });
    }
});
</script>

<style scoped>
.reorder-move {
    transition: all 0.1s ease-out;
}

.drop-move {
    transition: all 0s linear;
}

.drop-enter-active,
.drop-leave-active,
.reorder-enter-active,
.reorder-leave-active {
    transition: none 0s linear;
}
</style>