<template>
    <div class="px-4 flex whitespace-nowrap items-center text-xs" :class="rowClass" :style="{ height: height + 'px' }">
        <!-- TODO fallback when metadata not loaded -->
        <!-- TODO tooltips -->
        <!-- TODO removal support -->
        <!-- TODO context menu -->
        <!-- TODO placeholder while image is loading or failed to load -->
        <img v-if="!compact && thumbnailURL" class="basis-10 mr-3 shrink-0 h-10 rounded-md" :src="thumbnailURL" />
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis" v-if="song">{{ formatTrackContext(song) }}</div>
        <div class="basis-8 shrink-0 text-right mr-2" v-if="song">{{ formatTrackNumber(song) }}</div>
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis" v-if="song">
            {{ formatTitle(song) }}
            <span :class="selected ? '' : 'text-ls-400'"
                v-if="song.artists && song.album_artists && !equals(song.artists, song.album_artists)">
                ({{ formatArtists(song.artists) }})
            </span>
        </div>
        <div class="basis-16 shrink-0 text-right" v-if="song">{{ formatTrackDuration(song) }}</div>
        <div v-if="focused" class="absolute h-full outline-1 outline-dotted -outline-offset-4 outline-accent-500"
            :class="compact ? 'left-1 right-1 rounded-md' : 'left-1.5 right-1.5 rounded-lg'" />
    </div>
</template>

<script setup lang="ts">
import equals from "array-equal"
import { computed } from 'vue';

import { Song } from '@/api/dto';
import { formatArtists, formatDuration, formatTitle, formatTrackNumber } from '@/format';
import { useSongsStore } from '@/stores/songs';
import { makeThumbnailURL } from '@/api/endpoints';

const songs = useSongsStore();

const props = defineProps<{
    path: string,
    height: number,
    index: number,
    selected: boolean,
    focused: boolean,
    compact: boolean,
}>();

const song = computed(() => {
    return songs.cache.get(props.path);
});

const thumbnailURL = computed(() => song.value?.artwork ? makeThumbnailURL(song.value.artwork, "tiny") : undefined);

const rowClass = computed(() => {
    let background = "bg-ls-0";
    if (props.selected) {
        background = "bg-accent-100";
    } else if (props.index % 2 == 0) {
        background = "bg-ls-50";
    }

    return [
        background,
        props.selected ? "text-accent-700 dark:text-accent-200" : "text-ls-700 dark:text-ds-400",
    ];
});

function formatTrackContext(song: Song) {
    let context = "";
    if (song.album_artists) {
        context += formatArtists(song.album_artists);
    } else if (song.artists) {
        context += formatArtists(song.artists);
    } else {
        context += "Unknown Artist";
    }
    context += " - ";
    context += song.album ? song.album : "Unknown Album";
    return context;
}

function formatTrackDetails(song: Song) {
    let details = "";
    if (song.track_number) {
        details += song.track_number;
        details += ". ";
    }
    details += formatTitle(song);
    return details;
}

function formatTrackDuration(song: Song) {
    if (!song.duration || isNaN(song.duration)) {
        return "??:??";
    }
    return formatDuration(song.duration);
}
</script>