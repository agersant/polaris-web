<template>
    <div class="flex items-center">
        <div @click="onAlbumClicked" class="shrink-0 cursor-pointer w-24 h-24">
            <UseImage :src="artworkURL || ''" class="w-full h-full object-cover rounded-md"
                :class="albumURL ? 'cursor-pointer hover:opacity-90' : ''">
                <template #loading>
                    <div class="bg-ls-200 rounded-md w-full h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                </template>

                <template #error>
                    <div class="bg-ls-200 rounded-md w-full h-full flex items-center justify-center">
                        <span class="material-icons-round text-ls-500">image_not_supported</span>
                    </div>
                </template>
            </UseImage>
        </div>

        <div class="ml-4 min-w-0 flex flex-col text-sm">

            <div v-if="albumName" @click="onAlbumClicked"
                class="cursor-pointer mb-2 text-ls-900 overflow-hidden text-ellipsis"
                :class="albumURL ? 'cursor-pointer hover:underline hover:text-accent-600' : ''">
                {{ albumName }}
            </div>
            <div v-else class="rounded-full w-48 h-2.5 mt-1.5 mb-3 bg-ls-200" />

            <div v-if="artists" class="overflow-hidden text-ellipsis">
                <span v-for="artist, index in artists" class="text-ls-700">
                    <span @click="onArtistClicked(artist)"
                        :class="artist.url ? 'cursor-pointer hover:underline hover:text-accent-600' : ''">
                        {{ artist.name }}
                    </span>
                    <span v-if="index < artists.length - 1">{{ ", " }}</span>
                </span>
            </div>
            <div v-else class="rounded-full w-36 h-2.5 my-[5px] bg-ls-200" />

            <div v-if="song && song.year" class="text-ls-500 overflow-hidden text-ellipsis">
                {{ song.year }}
            </div>
            <div v-else class="rounded-full w-12 h-2.5 my-[5px] bg-ls-200" />

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from "vue-router";
import { UseImage } from '@vueuse/components';

import { makeThumbnailURL } from '@/api/endpoints';
import Spinner from '@/components/basic/Spinner.vue';
import { usePlaylistStore } from '@/stores/playlist';
import { useSongsStore } from '@/stores/songs';
import { URI_ARRAY_SEPARATOR } from '@/router';

interface Artist {
    name: string,
    url?: string,
}

const router = useRouter();
const playlist = usePlaylistStore();
const songs = useSongsStore();

const currentTrack = computed(() => playlist.currentTrack);

const song = computed(() => {
    if (!currentTrack.value) {
        return undefined;
    }
    return songs.cache.get(currentTrack.value.path)
});

const artworkURL = computed(() => song.value && song.value.artwork ? makeThumbnailURL(song.value.artwork, "small") : null);

const albumName = computed(() => {
    if (!song.value) {
        return undefined;
    }
    return song.value?.album || "Unknown Album";
});

const albumURL = computed(() => {
    const album = song.value?.album;
    if (!album) {
        return undefined;
    }

    let artists = song.value.artists;
    if (song.value.album_artists?.length) {
        artists = song.value.album_artists;
    }

    // TODO this breaks when artists or album name contain `/` character (eg. OCRemix)
    return `/albums/${(artists || []).join(URI_ARRAY_SEPARATOR)}/${album}`;
});

const artists = computed(() => {
    if (!song.value) {
        return undefined;
    }

    let names: string[] = [];
    if (song.value.album_artists?.length) {
        names = song.value.album_artists;
    } else if (song.value.artists?.length) {
        names = song.value.artists;
    }

    if (!names.length) {
        return [{ name: "Unknown Artist", url: undefined }];
    }

    return names.map(n => {
        return {
            name: n,
            url: `/artists/${n}`,
        };
    });
});

function onArtistClicked(artist: Artist) {
    if (artist.url) {
        router.push(artist.url).catch(err => { });
    }
}

function onAlbumClicked() {
    if (albumURL.value) {
        router.push(albumURL.value).catch(err => { });
    }
}
</script>
