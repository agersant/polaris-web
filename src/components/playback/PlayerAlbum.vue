<template>
    <div class="flex items-center">
        <!-- TODO tooltips -->
        <div @click="onAlbumClicked" class="shrink-0 cursor-pointer w-24 h-24">
            <AlbumArt :url="artworkURL" />
        </div>

        <div class="ml-4 min-w-0 flex flex-col text-sm">

            <div v-if="albumName" @click="onAlbumClicked"
                class="cursor-pointer mb-2 text-ls-900 dark:text-ds-200 overflow-hidden text-ellipsis"
                :class="albumURL ? 'cursor-pointer hover:underline hover:text-accent-600' : ''">
                {{ albumName }}
            </div>
            <div v-else class="rounded-full w-48 h-2.5 mt-1.5 mb-3 bg-ls-200 dark:bg-ds-700" />

            <div v-if="artists" class="overflow-hidden text-ellipsis">
                <span v-for="artist, index in artists" class="text-ls-500 dark:text-ds-500">
                    <span @click="onArtistClicked(artist)"
                        :class="artist.url ? 'cursor-pointer hover:underline hover:text-accent-600' : ''">
                        {{ artist.name }}
                    </span>
                    <span v-if="index < artists.length - 1">{{ ", " }}</span>
                </span>
            </div>
            <div v-else class="rounded-full w-36 h-2.5 my-[5px] bg-ls-200 dark:bg-ds-700" />

            <div v-if="song && song.year" class="text-ls-400 dark:text-ds-600 overflow-hidden text-ellipsis">
                {{ song.year }}
            </div>
            <div v-else class="rounded-full w-12 h-2.5 my-[5px] bg-ls-200 dark:bg-ds-700" />

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from "vue-router";

import { makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';
import { usePlaybackStore } from '@/stores/playback';
import { makeAlbumURLFromSong, makeArtistURL } from '@/router';

interface Artist {
    name: string,
    url?: string,
}

const router = useRouter();
const playback = usePlaybackStore();

const song = computed(() => playback.currentSong);

const artworkURL = computed(() => song.value?.artwork ? makeThumbnailURL(song.value.artwork, "small") : undefined);

const albumName = computed(() => {
    if (!song.value) {
        return undefined;
    }
    return song.value?.album || "Unknown Album";
});

const albumURL = computed(() => {
    if (!song.value) {
        return undefined;
    }
    return makeAlbumURLFromSong(song.value);
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
            url: makeArtistURL(n),
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
