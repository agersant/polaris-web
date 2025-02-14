<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-center items-center text-sm text-ls-900 dark:text-ds-200 gap-1">
            <div v-if="artists" class="overflow-hidden text-ellipsis">
                <span v-for="artist, index in artists">
                    <span @click="onArtistClicked(artist)"
                        :class="artist.url ? 'cursor-pointer hover:underline hover:text-accent-600' : 'pointer-events-none'">
                        {{ artist.name }}
                    </span>
                    <span v-if="index < artists.length - 1">{{ ", " }}</span>
                </span>
            </div>
            <div v-if="artists" class="text-ls-400 dark:text-ds-200">-</div>
            <span v-if="song" @click="router.push(makeSongURL(song.path))"
                class="cursor-pointer hover:underline hover:text-accent-600 overflow-hidden text-ellipsis">
                {{ formatTitle(song) }}
            </span>
            <span v-else class="rounded-full w-40 mt-1 h-3 mb-1 bg-ls-200 dark:bg-ds-700" />
        </div>
        <div class="flex grow items-center gap-4 text-xs text-ls-700 dark:text-ds-400">
            <div class="w-10 text-right">
                {{ currentTrack ? formatDuration(props.secondsPlayed) : "-:--" }}
            </div>
            <Waveform :path="currentTrack?.path" :duration="duration" :progress="progress" @seek="s => emit('seek', s)"
                class="grow h-8" />
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
import { formatDuration, formatTitle, isFakeArtist } from "@/format";
import { usePlaybackStore } from '@/stores/playback';
import { makeArtistURL, makeSongURL } from '@/router';

const router = useRouter();
const playback = usePlaybackStore();

interface Artist {
    name: string,
    url?: string,
}

const props = defineProps<{
    secondsPlayed: number,
    duration: number,
    progress: number,
}>();

const emit = defineEmits<{
    "seek": [progress: number],
}>();

const currentTrack = computed(() => playback.currentTrack);
const song = computed(() => playback.currentSong);

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
            url: isFakeArtist(n) ? undefined : makeArtistURL(n),
        };
    });
});

function onArtistClicked(artist: Artist) {
    if (artist.url) {
        router.push(artist.url).catch(err => { });
    }
}
</script>
