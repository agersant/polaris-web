<template>
    <div ref="viewport" class="overflow-y-auto -m-4 p-4 mb-0 pb-0" tabindex="-1" :style="{
        gap: `${gapSize}px`,
    }">
        <div class="relative" :style="{ height: `${contentHeight}px` }">
            <AlbumGridCell ref="sampleCell" :album="sampleAlbum" :size="cellSize" :show-artists="showArtists"
                class="absolute opacity-0" :style="{ width: `${itemWidth}px` }" />
            <AlbumGridCell v-for="(album, index) of virtualAlbums" :key="album.name + album.main_artists.join('')"
                :album="album" :size="cellSize" :show-artists="showArtists" data-pw="album" class="absolute" :style="{
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
import { useElementSize, useMediaQuery, useScroll } from '@vueuse/core';

import { AlbumHeader } from '@/api/dto';
import AlbumGridCell from '@/components/library/AlbumGridCell.vue';

const props = defineProps<{
    albums: AlbumHeader[],
    showArtists: boolean,
    maxRows?: number,
}>();

const gapSize = ref(32);

const isTinyScreen = useMediaQuery("(width < 80rem)");
const isSmallScreen = useMediaQuery("(width < 96rem)");
const numColumns = computed(() => isTinyScreen.value ? 2 : isSmallScreen.value ? 3 : 5);
const cellSize = computed(() =>
    numColumns.value <= 3 ? "lg" : "md",
);

const viewport = useTemplateRef("viewport");
const { width: viewportWidth, height: viewportHeight } = useElementSize(viewport);
const { y: scrollY } = useScroll(viewport);

const sampleCell = useTemplateRef("sampleCell");
const itemWidth = computed(() =>
    (viewportWidth.value - (numColumns.value - 1) * gapSize.value) / numColumns.value
);
const { height: itemHeight } = useElementSize(sampleCell);

const trimmedAlbums = computed(() => {
    if (props.maxRows) {
        return props.albums.slice(0, props.maxRows * numColumns.value);
    } else {
        return props.albums;
    }
});
const contentHeight = computed(() => Math.ceil(trimmedAlbums.value.length / numColumns.value) * (itemHeight.value + gapSize.value));

const firstVirtual = computed(() => Math.floor(scrollY.value / (itemHeight.value + gapSize.value)) * numColumns.value);
const numVirtualItems = computed(() => Math.ceil(1 + viewportHeight.value / (itemHeight.value + gapSize.value)) * numColumns.value);

const virtualAlbums = computed(() => {
    return trimmedAlbums.value.slice(firstVirtual.value, firstVirtual.value + numVirtualItems.value);
});

// TODO Random page, click any album, press back button, something wacky happens and layout explodes
const sampleAlbum = {
    name: "WWWW ".repeat(10),
    main_artists: ["WWWW ".repeat(10)],
    year: 2000,
};

defineExpose({ contentHeight, numColumns });
</script>
