<template>
    <div v-bind="containerProps" tabindex="-1" @keydown="onKeyDown" class="-mx-4 px-4">
        <div v-bind="wrapperProps">
            <SongListRow v-for="item in virtualItems" :style="`height: ${itemHeight}px`" :path="item.data.key"
                :index="item.index + +!!invertStripes" :compact="compact" :selected="selectedKeys.has(item.data.key)"
                :focused="focusedKey == item.data.key" @click="e => clickItem(e, item.data)" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useElementSize, useScroll, useVirtualList } from '@vueuse/core';

import useMultiselect from '@/multiselect';
import SongListRow from '@/components/SongListRow.vue';

const props = defineProps<{
    paths: string[],
    compact: boolean,
    invertStripes?: boolean,
}>();

const items = computed(() => props.paths.map(p => ({ key: p })));

const itemHeight = computed(() => props.compact ? 32 : 48);

const overscan = 1;
const { list: virtualItems, containerProps, wrapperProps, scrollTo } = useVirtualList(items, { itemHeight: () => itemHeight.value, overscan });
const viewport = computed(() => containerProps.ref.value);
const { y: scrollY } = useScroll(viewport);
const { height: viewportHeight } = useElementSize(viewport);

const { clickItem, onKeyDown, focusedKey, selectedKeys } = useMultiselect(
    items,
    { onMove: snapScrolling }
);

watch(itemHeight, (to, from) => {
    const halfHeight = viewportHeight.value / 2;
    const y = (scrollY.value + halfHeight) * to / from - halfHeight;
    nextTick(() => {
        viewport.value?.scrollTo({ top: y, behavior: "instant" });
    });
});

function snapScrolling() {
    const focusedIndex = items.value.findIndex(n => n.key == focusedKey.value);
    if (focusedIndex < 0) {
        return;
    }

    const padding = 4 + overscan;
    const nodes = virtualItems.value;
    const first = nodes[0].index;
    const last = nodes[nodes.length - 1].index;

    if (focusedIndex <= first + padding) {
        scrollTo(Math.max(0, focusedIndex - padding));
    } else if (focusedIndex >= last - padding) {
        scrollTo(focusedIndex - (last - first) + padding);
    }
}

</script>
