<template>
    <div ref="viewport" class="overflow-y-scroll -m-4 p-4 mb-0 pb-0" tabindex="-1" :style="{
        gap: `${gapSize}px`,
    }">
        <div class="relative" :style="{ height: `${contentHeight}px` }">
            <AlbumGridCell ref="sampleCell" :album="sampleAlbum" :size="cellSize" :show-artists="showArtists"
                class="absolute opacity-0" :style="{ width: `${itemWidth}px` }" />
            <AlbumGridCell v-for="(album, index) of virtualAlbums" :key="album.name + album.main_artists.join('')"
                :album="album" :size="cellSize" :show-artists="showArtists" class="absolute" :style="{
                    width: `${itemWidth}px`,
                    left: `${((index + firstVirtual) % numColumns) * (itemWidth + gapSize)}px`,
                    top: `${Math.floor((index + firstVirtual) / numColumns) * (itemHeight + gapSize)}px`,
                }" />
        </div>
        <slot name="footer" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useElementSize, useScroll } from '@vueuse/core';

import { AlbumHeader } from '@/api/dto';
import AlbumGridCell from '@/components/library/AlbumGridCell.vue';

const props = defineProps<{
    albums: AlbumHeader[],
    showArtists: boolean,
    numColumns: number,
}>();

const gapSize = ref(32);

const cellSize = computed(() =>
    props.numColumns <= 3 ? "lg" : "md",
);

const viewport = useTemplateRef("viewport");
const { width: viewportWidth, height: viewportHeight } = useElementSize(viewport);
const { y: scrollY } = useScroll(viewport);

const sampleCell = useTemplateRef("sampleCell");
const itemWidth = computed(() =>
    (viewportWidth.value - (props.numColumns - 1) * gapSize.value) / props.numColumns
);
const { height: itemHeight } = useElementSize(sampleCell);

const contentHeight = computed(() => Math.ceil(props.albums.length / props.numColumns) * (itemHeight.value + gapSize.value));

const firstVirtual = computed(() => Math.floor(scrollY.value / (itemHeight.value + gapSize.value)) * props.numColumns);
const numVirtualItems = computed(() => Math.ceil(1 + viewportHeight.value / (itemHeight.value + gapSize.value)) * props.numColumns);

const virtualAlbums = computed(() => {
    return props.albums.slice(firstVirtual.value, firstVirtual.value + numVirtualItems.value);
});

const sampleAlbum = {
    name: "WWWW ".repeat(10),
    main_artists: ["WWWW ".repeat(10)],
    year: 2000,
};

defineExpose({ contentHeight });
</script>
