<template>
    <div class="flex flex-col gap-2" data-pw="album">
        <div @click="router.push(makeAlbumURL(album.main_artists, album.name))"
            :class="size == 'lg' ? 'hover:scale-105' : 'hover:scale-110'" class="
                cursor-pointer aspect-square w-full origin-center 
                transition-all ease-out duration-100
                hover:opacity-90
                ">
            <Draggable :make-payload="() => new DndPayloadAlbumKey(album.name, album.main_artists)">
                <AlbumArt :url="album.artwork ? makeThumbnailURL(album.artwork, 'small') : undefined" />
                <template #drag-preview>
                    <AlbumDragPreview :album="album" />
                </template>
            </Draggable>
        </div>
        <div class="font-medium text-sm whitespace-normal text-ls-500 dark:text-ds-400">
            <span v-text="album.name" class="mb-1 line-clamp-2 text-ls-900 dark:text-ds-200" />
            <span v-if="showArtists" class="line-clamp-1">
                <span v-for="(artist, index) of album.main_artists">
                    <span v-text="artist" @click="onArtistClicked(artist)"
                        :class="{ 'cursor-pointer hover:underline hover:text-accent-600': !isFakeArtist(artist) }" />
                    <span v-if="index < album.main_artists.length - 1" v-text="`, `" />
                </span>
            </span>
            <span v-if="!showArtists" v-text="album.year" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

import { AlbumHeader } from '@/api/dto';
import { makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';
import Draggable from '@/components/basic/Draggable.vue';
import AlbumDragPreview from '@/components/library/AlbumDragPreview.vue';
import { DndPayloadAlbumKey } from '@/dnd';
import { isFakeArtist } from '@/format';
import { makeAlbumURL, makeArtistURL } from '@/router';

const router = useRouter();

defineProps<{
    album: AlbumHeader,
    showArtists: boolean,
    size: "md" | "lg",
}>();

function onArtistClicked(name: string) {
    if (!isFakeArtist(name)) {
        router.push(makeArtistURL(name));
    }
}

</script>