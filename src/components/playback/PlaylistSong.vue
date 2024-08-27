<template>
    <div class="flex whitespace-nowrap items-center rounded-sm text-xs" :class="rowClass"
        :style="{ height: height + 'px' }">
        <!-- TODO fallback when metadata not loaded -->
        <!-- TODO tooltips -->
        <!-- TODO removal support -->
        <!-- TODO context menu -->
        <!-- TODO placeholder while image is loading or failed to load -->
        <img v-if="!compact && thumbnailURL" class="basis-10 mr-3 shrink-0 h-10 rounded-md" :src="thumbnailURL" />
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis" v-if="song">{{ formatTrackContext(song) }}</div>
        <div class="basis-8 shrink-0 text-right mr-1" v-if="song">{{ formatTrackNumber(song) }}.</div>
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis" v-if="song">
            {{ formatTitle(song) }}
            <span :class="selected ? '' : 'text-ls-400'"
                v-if="song.artists && song.album_artists && !equals(song.artists, song.album_artists)">
                ({{ formatArtists(song.artists) }})
            </span>
        </div>
        <div class="basis-16 shrink-0 text-right" v-if="song">{{ formatTrackDuration(song) }}</div>
        <div v-if="focused"
            class="absolute left-px right-px top-px bottom-px outline-1 outline-dotted outline-accent-500" />
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

    const isOdd = props.index % 2 == 1;

    let background;
    if (props.selected) {
        background = "bg-accent-100";
    } else if (props.compact) {
        background = isOdd ? "bg-ls-50 hover:bg-ls-100" : "bg-ls-0 hover:bg-ls-100";
    } else {
        background = [
            "bg-gradient-to-r from-ls-0 to-[50px] hover:to-ls-100",
            isOdd ? "to-ls-50" : "to-ls-0",
        ];
    }

    return [
        background,
        props.compact ? "px-3" : "px-2",
        !props.compact && !props.selected ? "mr-2" : "",
        !props.compact && props.selected ? "pr-4" : "",
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

function formatTrackDuration(song: Song) {
    if (!song.duration || isNaN(song.duration)) {
        return "??:??";
    }
    return formatDuration(song.duration);
}
</script>