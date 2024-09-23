<template>
    <div v-bind="containerProps">
        <div v-bind="wrapperProps">
            <SongListRow v-for="item in virtualItems" :style="`height: ${itemHeight}px`" :path="item.data.key"
                :index="item.index + +!!invertStripes" :compact="compact" :selected="selectedKeys.has(item.data.key)"
                :focused="focusedKey == item.data.key" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVirtualList } from '@vueuse/core';

import useMultiselect from '@/multiselect';
import SongListRow from '@/components/SongListRow.vue';

const props = defineProps<{
    paths: string[],
    compact: boolean,
    invertStripes?: boolean,
}>();

const items = computed(() => props.paths.map(p => ({ key: p })));

const itemHeight = computed(() => props.compact ? 32 : 48);

const { list: virtualItems, containerProps, wrapperProps, scrollTo } = useVirtualList(items, { itemHeight: () => itemHeight.value });

const { clickItem, multiselect, focusedKey, pivotKey, selectedKeys, selection, selectItem } = useMultiselect(
    items,
    // { onMove: () => snapScrolling("clamp", "instant") } TODO
);

</script>