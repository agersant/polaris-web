<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-center items-center text-sm text-ls-900 gap-1">
            <div v-if="artists" class="overflow-hidden text-ellipsis">
                <span v-for="artist, index in artists">
                    <span @click="onArtistClicked(artist)"
                        :class="artist.url ? 'cursor-pointer hover:underline hover:text-accent-600' : 'pointer-events-none'">
                        {{ artist.name }}
                    </span>
                    <span v-if="index < artists.length - 1">{{ ", " }}</span>
                </span>
            </div>
            <div v-if="artists" class="text-ls-400">-</div>
            <!-- TODO song click interaction -->
            <span v-if="song"
                class="cursor-pointer hover:underline hover:text-accent-600 overflow-hidden text-ellipsis select-text">
                {{ formatTitle(song) }}
            </span>
            <span v-else class="rounded-full w-40 mt-1 h-3 mb-1 bg-ls-200" />
        </div>
        <div class="flex grow items-center gap-4 text-xs text-ls-700">
            <div class="w-10 text-right">
                {{ currentTrack ? formatDuration(props.secondsPlayed) : "-:--" }}
            </div>
            <Waveform :path="currentTrack?.path" :progress="progress" class="grow h-8" />
            <div class="w-10">
                {{ song && song.duration ? formatDuration(song.duration) : "-:--" }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import Waveform from '@/components/playback/Waveform.vue';
import { formatDuration, formatTitle } from "@/format";
import { usePlaylistStore } from '@/stores/playlist';
import { useSongsStore } from '@/stores/songs';

const router = useRouter();
const playlist = usePlaylistStore();
const songs = useSongsStore();

interface Artist {
    name: string,
    url?: string,
}

const props = defineProps<{
    secondsPlayed: number,
    progress: number,
}>();

const currentTrack = computed(() => playlist.currentTrack);

const song = computed(() => {
    if (!currentTrack.value) {
        return undefined;
    }
    return songs.cache.get(currentTrack.value.path)
});

const artists = computed(() => {
    if (!song.value) {
        return undefined;
    }

    let names: string[] = [];
    if (song.value.artists?.length) {
        names = song.value.artists;
    } else if (song.value.album_artists?.length) {
        names = song.value.album_artists;
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
</script>
