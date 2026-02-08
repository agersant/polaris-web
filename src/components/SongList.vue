<template>
    <div v-bind="containerProps" tabindex="-1" @keydown="onKeyDown" class="-mx-4 px-4">
        <div v-bind="wrapperProps">
            <ContextMenu :items="contextMenuItems">
                <Draggable v-for="item in virtualItems" :key="item.index" :allow-pointer-events-inside="true"
                    @draggable-start="onDragStart($event, item.data.key)"
                    :make-payload="() => new DndPayloadPaths(selection.map(s => s.key))"
                    :style="`height: ${itemHeight}px`">
                    <SongListRow :path="item.data.key" :index="item.index + +!!invertStripes" :compact="compact"
                        :selected="selectedKeys.has(item.data.key)" :focused="focusedKey == item.data.key"
                        @dblclick="onSongDoubleClicked(item.data.key)" @contextmenu="onSongRightClicked(item.data.key)"
                        @click="(e: MouseEvent) => clickItem(e, item.data)" />
                    <template #drag-preview="{ payload }">
                        <div class="flex items-center gap-2">
                            <span v-text="'audiotrack'" class="material-icons-round" />
                            <span v-text="payload?.getDescription()" />
                        </div>
                    </template>
                </Draggable>
            </ContextMenu>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, watch } from 'vue';
import { useElementSize, useScroll, useVirtualList } from '@vueuse/core';

import { DndPayloadPaths } from '@/dnd';
import useMultiselect from '@/multiselect';
import ContextMenu from '@/components/basic/ContextMenu.vue';
import Draggable from '@/components/basic/Draggable.vue';
import SongListRow from '@/components/SongListRow.vue';
import { saveScrollState, useHistory } from '@/history';
import { usePlaybackStore } from '@/stores/playback';
import { useSongsStore } from '@/stores/songs';

const playback = usePlaybackStore();
const songs = useSongsStore();

const props = defineProps<{
    compact: boolean,
    invertStripes?: boolean,
}>();

const paths = defineModel<string[]>({ required: true });

const items = computed(() => paths.value.map(p => ({ key: p })));

const contextMenuItems = [
    { label: "Play", shortcut: "Enter", action: () => { queueSelection(true) } },
    { label: "Queue", shortcut: "Shift+Enter", action: () => { queueSelection(false) } },
];

const itemHeight = computed(() => props.compact ? 32 : 48);

const overscan = 1;
const { list: virtualItems, containerProps, wrapperProps, scrollTo } = useVirtualList(items, { itemHeight: () => itemHeight.value, overscan });
const viewport = computed(() => containerProps.ref.value);
const { y: scrollY } = useScroll(viewport);
const { height: viewportHeight } = useElementSize(viewport);

const { clickItem, focusedKey, multiselect, pivotKey, selectedKeys, selectItem, selection } = useMultiselect(
    items,
    { onMove: snapScrolling }
);

watch(itemHeight, (to, from) => {
    const halfHeight = viewportHeight.value / 2;
    const y = (scrollY.value + halfHeight) * to / from - halfHeight;
    nextTick(() => {
        scrollY.value = y;
    });
});

watch(paths, () => {
    scrollY.value = 0;
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

function onKeyDown(event: KeyboardEvent) {
    multiselect.onKeyDown(event);
    if (event.code == "Enter") {
        queueSelection(!event.shiftKey);
    }
}

async function queueSelection(replace: boolean) {
    const tracks = selection.value.map(s => s.key);
    if (!tracks.length) {
        return;
    }

    if (replace) {
        playback.clear();
        playback.stop();
    }
    playback.queueTracks(tracks);
}

function onDragStart(event: DragEvent, path: string) {
    if (!selectedKeys.value.has(path)) {
        selectItem({ key: path });
    }
}

function onSongDoubleClicked(path: string) {
    playback.clear();
    playback.stop();
    playback.queueTracks([path]);
}

function onSongRightClicked(path: string) {
    if (!selectedKeys.value.has(path)) {
        selectItem({ key: path });
    }
}

useHistory("song-list", [paths, selectedKeys, focusedKey, pivotKey, saveScrollState(viewport)]);

onMounted(() => {
    songs.request(paths.value);
})
</script>
