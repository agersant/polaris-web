<template>
    <div class="flex flex-col gap-2">
        <ContextMenu :items="contextMenuItems">
            <div @click="router.push(makeAlbumURL(album.main_artists, album.name))"
                :class="size == 'lg' ? 'hover:scale-105' : 'hover:scale-110'" class="
                cursor-pointer aspect-square w-full min-h-0 origin-center 
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
        </ContextMenu>
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

import { AlbumHeader, AlbumKey } from '@/api/dto';
import { getAlbum, makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';
import ContextMenu from '@/components/basic/ContextMenu.vue';
import Draggable from '@/components/basic/Draggable.vue';
import AlbumDragPreview from '@/components/library/AlbumDragPreview.vue';
import { DndPayloadAlbumKey } from '@/dnd';
import { isFakeArtist } from '@/format';
import { usePlaybackStore } from '@/stores/playback';
import { makeAlbumURL, makeArtistURL } from '@/router';

const router = useRouter();
const playback = usePlaybackStore();

const props = defineProps<{
    album: AlbumHeader,
    showArtists: boolean,
    size: "md" | "lg",
}>();

function onArtistClicked(name: string) {
    if (!isFakeArtist(name)) {
        router.push(makeArtistURL(name));
    }
}

const contextMenuItems = [
    { label: "Play", action: () => { play(true) } },
    { label: "Queue", action: () => { play(false) } },
];

async function play(replace: boolean) {
    const key: AlbumKey = {
        name: props.album.name,
        artists: props.album.main_artists,
    };

    const songs = await getAlbum(key).then(a => a.songs.map(s => s.path));

    if (replace) {
        playback.clear();
        playback.stop();
    }

    playback.queueTracks(songs);
}

</script>