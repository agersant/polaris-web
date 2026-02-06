<template>
    <div ref="viewport" class="overflow-y-auto overflow-x-hidden" tabindex="-1" @keydown="onKeyDown" @dragenter.prevent
        @dragover.prevent @drop="onDrop">
        <div ref="wrapper" class="relative min-h-full divide-ls-200 dark:border-ds-700" :class="{ 'divide-y': divider }"
            :style="{ height: `${props.items.length * rowHeight}px` }">
            <TransitionGroup :name="isReordering ? 'reorder' : 'drop'" :css="isReordering">
                <div v-for="item, index of virtualItems" @click="e => clickItem(e, item)" :key="item.key"
                    :draggable="true" @dragstart="e => onDragStart(e, item)" @dragend="onDragEnd"
                    class="absolute w-full"
                    :style="{ translate: `0 ${rowOffset(firstVirtualIndex + index)}px`, height: `${itemHeight}px` }">

                    <slot name="drop-preview" v-if="item.isDropPreview">
                        <div :style="{ height: itemHeight + 'px' }">Drop Preview</div>
                    </slot>

                    <slot name="default" v-else :item="item" :index="firstVirtualIndex + index"
                        :selected="selectedKeys.has(item.key)" :focused="focusedKey == item.key">
                        <div class="whitespace-nowrap" :class="{ 'bg-accent-500': selectedKeys.has(item.key) }"
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
import { computed, nextTick, ref, toRaw, useTemplateRef, watch } from 'vue';
import { useCached, useElementSize, useLastChanged, useMouseInElement, useMousePressed, useRafFn, useScroll } from '@vueuse/core';

import useMultiselect from '@/multiselect';

const { divider = false, ...props } = defineProps<{
    items: T[],
    itemHeight: number,
    divider?: boolean,
    showDropPreview: boolean,
}>();

const emit = defineEmits<{
    'list-drop': [toIndex: number]
    'list-reorder': [items: T[], toIndex: number]
    'list-delete': [items: T[]]
}>();

const viewport = useTemplateRef("viewport");
const wrapper = useTemplateRef("wrapper");

const blankImage = new Image(0, 0);
blankImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

const { y: scrollY } = useScroll(viewport);
const { width: viewportWidth, height: rawViewportHeight } = useElementSize(viewport);
const viewportHeight = computed(() => rawViewportHeight.value || viewport.value?.clientHeight || 0);
const { elementX: viewportMouseX, elementY: viewportMouseY, isOutside } = useMouseInElement(viewport);
const { elementY: wrapperMouseY } = useMouseInElement(wrapper);
const { pressed: mousePressed } = useMousePressed({ target: viewport });
const mouseLastPressed = useLastChanged(mousePressed, { initialValue: 0 });

const dividerHeight = computed(() => divider ? 1 : 0);
const rowHeight = computed(() => props.itemHeight + dividerHeight.value);

function rowOffset(index: number) {
    return index * rowHeight.value - (index > 0 ? dividerHeight.value : 0);
}

const firstVirtualIndex = computed(() => {
    return Math.floor(scrollY.value / rowHeight.value);
});

const numVirtualItems = computed(() => {
    return 1 + Math.ceil(viewportHeight.value / rowHeight.value);
});

const isReordering = ref(false);
const rawDropIndex = computed(() => {
    if (isOutside.value) {
        return;
    }

    if (!isReordering.value && !props.showDropPreview) {
        return;
    }

    const max = isReordering.value ? props.items.length - 1 : props.items.length;
    return Math.max(0, Math.min(Math.floor(wrapperMouseY.value / rowHeight.value), max));
});
const dropIndex = useCached(rawDropIndex, (i) => i == undefined);

const { clickItem, multiselect, focusedKey, pivotKey, selectedKeys, selection, selectItem } = useMultiselect(
    () => props.items,
    { onMove: () => snapScrolling("clamp", "instant") }
);

const orderedItems = computed(() => {
    let selected = toRaw(selectedKeys.value);
    let items = toRaw(props.items);
    let dropAt = dropIndex.value;

    if (!isReordering.value || dropIndex.value == undefined) {
        return items;
    }

    let reordered: T[] = [];
    let insertLocation = items.length - selected.size;

    for (let i = 0; i < items.length; i++) {
        if (reordered.length == dropAt) {
            insertLocation = reordered.length;
        }
        if (!selected.has(items[i].key)) {
            reordered.push(items[i]);
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

watch(() => props.itemHeight, (to, from) => {
    const halfHeight = viewportHeight.value / 2;
    const y = (scrollY.value + halfHeight) * to / from - halfHeight;
    nextTick(() => {
        scrollY.value = y;
    });
});

defineExpose({ isIdle, selectItem, selection, snapScrolling });

function isIdle() {
    if (isReordering.value || props.showDropPreview) {
        return true;
    }
    return (Date.now() - mouseLastPressed.value) > 200;
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
        emit("list-reorder", selection.value, dropIndex.value);
    }
}

function onDrop() {
    emit("list-drop", dropIndex.value || 0);
}

function onKeyDown(event: KeyboardEvent) {
    multiselect.onKeyDown(event);
    switch (event.code) {
        case 'Delete':
            deleteSelection();
            event.preventDefault();
            break;
        default:
            break;
    }
}

function snapScrolling(mode: "clamp" | "center", behavior: ScrollBehavior) {
    const focusedIndex = props.items.findIndex(i => i.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    if (document.hidden) {
        behavior = "instant";
    }

    let y = scrollY.value;
    if (mode == "clamp") {
        const padding = 4;
        const first = firstVirtualIndex.value;
        const last = first + virtualItems.value.length - 1;
        if (focusedIndex < first + padding) {
            y = rowHeight.value * (focusedIndex - padding);
        } else if (focusedIndex > last - padding) {
            y = rowHeight.value * (focusedIndex - (last - first) + padding);
        }
    } else {
        y = (focusedIndex + 0.5) * rowHeight.value - viewportHeight.value / 2;
    }

    if (rowHeight.value * props.items.length > 50 * window.innerHeight) {
        behavior = "instant";
    }

    viewport.value?.scrollTo({ top: y, behavior });
}

function deleteSelection() {
    const pivot = props.items.findIndex(i => i.key == pivotKey.value);
    const newSelection = props.items.find((item, index) =>
        pivot >= 0 && index > pivot && !selectedKeys.value.has(item.key)
    );

    emit("list-delete", selection.value);

    if (newSelection) {
        selectItem(newSelection);
        nextTick(() => snapScrolling("clamp", "instant"));
    }
}

function remap(value: number, fromA: number, fromB: number, toA: number, toB: number) {
    return toA + (toB - toA) * Math.max(0, Math.min((value - fromA) / (fromB - fromA), 1));
}

useRafFn(({ delta }) => {
    if (!wrapper.value || !viewport.value) {
        return;
    }

    if (!isReordering.value && !props.showDropPreview) {
        return;
    }

    if (viewportMouseX.value < 0 || viewportMouseX.value > viewportWidth.value) {
        return;
    }

    const triggerRange = 100;
    const maxTracksPerSecond = 40;

    if (viewportMouseY.value < triggerRange) {
        const t = remap(
            viewportMouseY.value,
            0, triggerRange,
            1, 0
        );
        const tracksPerSecond = -maxTracksPerSecond * Math.pow(t, 1.5);
        viewport.value.scrollBy({
            behavior: "instant",
            top: Math.ceil(tracksPerSecond * rowHeight.value * delta / 1000)
        });
    } else if (viewportMouseY.value > viewportHeight.value - triggerRange) {
        const t = remap(
            viewportMouseY.value,
            viewportHeight.value - triggerRange,
            viewportHeight.value,
            0, 1
        );
        const tracksPerSecond = maxTracksPerSecond * Math.pow(t, 3);
        viewport.value.scrollBy({
            behavior: "instant",
            top: Math.ceil(tracksPerSecond * rowHeight.value * delta / 1000)
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