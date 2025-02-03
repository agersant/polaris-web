<template>
    <div class="flex flex-col">
        <div v-if="!song" class="grow flex items-center justify-center">
            <Spinner />
        </div>

        <div v-else class="flex flex-col min-h-0">
            <PageTitle :label="title" />

            <div class="-mx-8 px-8 min-h-0 overflow-y-auto">
                <div class="flex items-center gap-6 mt-3 mb-8">
                    <div @click="onAlbumClicked" class="shrink-0 basis-24 rounded-lg shadow-md" :class="[
                        albumURL ? 'cursor-pointer origin-center transition-all ease-out duration-100 hover:opacity-90 hover:scale-125' : '',
                    ]
                        ">
                        <Draggable :disabled="!hasValidAlbum"
                            :make-payload="() => new DndPayloadAlbumKey(song?.album || '', mainArtists)">
                            <AlbumArt :url="artworkURLSmall" />
                            <template #drag-preview>
                                <div class="flex items-center gap-2">
                                    <div class="size-10">
                                        <AlbumArt :url="artworkURLTiny" />
                                    </div>
                                    <div class="max-w-80 font-medium text-sm" v-text="album" />
                                </div>
                            </template>
                        </Draggable>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div v-text="title"
                            class="font-semibold line-clamp-2 overflow-hidden text-ls-900 dark:text-ds-0" />
                        <div v-text="song.path"
                            class="text-sm line-clamp-2 overflow-hidden text-ls-500 dark:text-ds-400" />
                    </div>
                </div>
                <div class="divide-y
                    divide-ls-100 dark:divide-ds-700
                    even:*:bg-ls-0 odd:*:bg-ls-50
                    dark:even:*:bg-ds-700/30 dark:odd:*:bg-ds-800/30
                    ">
                    <SongField v-if="song.artists?.length" label="Artists"
                        :values="song.artists.map(v => ({ text: v, link: tryMakeArtistURL(v) }))" />
                    <SongField v-if="song.title" label="Title" :values="[{ text: song.title }]" />
                    <SongField v-if="song.album" label="Album"
                        :values="[{ text: song.album, link: makeAlbumURLFromSong(song) }]" />
                    <SongField v-if="song.year" label="Year" :values="[{ text: song.year.toString() }]" />
                    <SongField v-if="song.genres?.length" label="Genres"
                        :values="song.genres.map(v => ({ text: v, link: makeGenreURL(v) }))" />
                    <SongField v-if="song.composers?.length" label="Composers"
                        :values="song.composers.map(v => ({ text: v, link: tryMakeArtistURL(v) }))" />
                    <SongField v-if="song.album_artists?.length" label="Album artists"
                        :values="song.album_artists.map(v => ({ text: v, link: tryMakeArtistURL(v) }))" />
                    <SongField v-if="song.track_number" label="Track number"
                        :values="[{ text: song.track_number.toString() }]" />
                    <SongField v-if="song.disc_number" label="Disc number"
                        :values="[{ text: song.disc_number.toString() }]" />
                    <SongField v-if="song.duration" label="Duration"
                        :values="[{ text: formatLongDuration(song.duration) }]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { watchImmediate } from '@vueuse/core';
import { useRouter } from 'vue-router';

import { makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';
import Draggable from '@/components/basic/Draggable.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import SongField from '@/components/library/SongField.vue';
import { DndPayloadAlbumKey } from '@/dnd';
import { formatLongDuration, isFakeArtist } from '@/format';
import { useSongsStore } from '@/stores/songs';
import { makeAlbumURLFromSong, makeArtistURL, makeGenreURL } from '@/router';

const router = useRouter();
const songs = useSongsStore();

const props = defineProps<{
    path: string
}>();

const song = computed(() => songs.cache.get(props.path));

watchImmediate(() => props.path, () => {
    songs.request([props.path]);
});

const title = computed(() => song.value?.title || "Unknown Song");
const album = computed(() => song.value?.album || "Unknown Album");
const artworkURLSmall = computed(() => song.value?.artwork ? makeThumbnailURL(song.value.artwork, "small") : undefined);
const artworkURLTiny = computed(() => song.value?.artwork ? makeThumbnailURL(song.value.artwork, "tiny") : undefined);

const mainArtists = computed(() => {
    if (!song.value) {
        return [];
    }
    if (song.value.album_artists?.length) {
        return song.value.album_artists;
    } else if (song.value.artists?.length) {
        return song.value.artists;
    }
    return [];
});

const albumURL = computed(() => {
    if (!song.value) {
        return undefined;
    }
    return makeAlbumURLFromSong(song.value);
});

const hasValidAlbum = computed(() => albumURL.value !== undefined);

function tryMakeArtistURL(artist: string) {
    if (isFakeArtist(artist)) {
        return undefined;
    }
    return makeArtistURL(artist);
}

function onAlbumClicked() {
    if (!albumURL.value) {
        return;
    }
    router.push(albumURL.value);
}
</script>
