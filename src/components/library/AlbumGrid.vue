<template>
    <div class="flex flex-wrap content-start gap-y-8" :style="`column-gap: ${gapSize}px`">
        <div v-for="album of albums" class="flex flex-col gap-2" :style="itemStyle">
            <div @click="router.push(makeAlbumURL(album.main_artists, album.name))" :class="itemClass" class="
                cursor-pointer aspect-square w-full origin-center 
                transition-all ease-out duration-100
                hover:opacity-90
                ">
                <Draggable :make-payload="() => new DndPayloadAlbumHeader(album)">
                    <AlbumArt :url="album.artwork ? makeThumbnailURL(album.artwork, 'small') : undefined" />
                    <template #drag-preview>
                        <AlbumDragPreview :album="album" />
                    </template>
                </Draggable>
            </div>
            <div class="flex flex-col gap-1">
                <div class="font-medium text-sm line-clamp-2 text-ls-900 dark:text-ds-200" v-text="album.name" />
                <div class="font-medium text-sm text-ls-500 dark:text-ds-400" v-text="album.year" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from "vue-router";

import AlbumArt from '@/components/AlbumArt.vue';
import Draggable from '@/components/basic/Draggable.vue';
import AlbumDragPreview from '@/components/library/AlbumDragPreview.vue';
import { AlbumHeader } from '@/api/dto';
import { makeThumbnailURL } from '@/api/endpoints';
import { DndPayloadAlbumHeader } from '@/dnd';
import { makeAlbumURL } from '@/router';

const router = useRouter();

const props = defineProps<{
    albums: AlbumHeader[],
    numColumns: number,
}>();

const gapSize = ref(32);

const itemClass = computed(() => {
    return [
        props.numColumns <= 3 ? 'hover:scale-105' : 'hover:scale-110',
    ];
});

const itemStyle = computed(() => {
    return {
        width: `calc(${100 / props.numColumns}% - ${gapSize.value * (props.numColumns - 1) / props.numColumns}px)`,
    }
});
</script>