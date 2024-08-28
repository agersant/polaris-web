<template>
    <div class="flex whitespace-nowrap items-center rounded-sm text-xs" :class="rowClass"
        :style="{ height: height + 'px' }">
        <!-- TODO tooltips -->
        <!-- TODO context menu -->
        <div v-if="!compact" class="basis-10 h-10 mr-3 shrink-0 flex items-center">
            <!-- TODO placeholder while image is loading or failed to load -->
            <img v-if="thumbnailURL" class="rounded-md" :src="thumbnailURL" />
            <div v-else class="rounded-md bg-ls-200 w-10 h-10" />
        </div>
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis">
            <span v-if="song">{{ formatTrackContext(song) }}</span>
            <div v-else class="bg-ls-200 h-3 rounded-full" />
        </div>
        <div class="basis-8 shrink-0 text-right mr-1">
            <span v-if="song"> {{ formatTrackNumber(song) }}.</span>
        </div>
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis">
            <span v-if="song">
                {{ formatTitle(song) }}
                <span :class="selected ? '' : 'text-ls-400 dark:text-ds-600'"
                    v-if="song.artists && song.album_artists && !equals(song.artists, song.album_artists)">
                    ({{ formatArtists(song.artists) }})
                </span>
            </span>
            <div v-else class="bg-ls-200 h-3 rounded-full" />
        </div>
        <div class="basis-16 shrink-0 text-right">
            <span v-if="song">{{ formatTrackDuration(song) }}</span>
            <div v-else class="bg-ls-200 h-3 rounded-full" />
        </div>
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
        background = "bg-accent-100 dark:bg-accent-900";
    } else if (props.compact) {
        background = isOdd ? "bg-ls-50 hover:bg-ls-100 dark:bg-ds-800/20 dark:hover:bg-ds-800" : "bg-ls-0 hover:bg-ls-100 dark:bg-ds-900 dark:hover:bg-ds-800";
    } else {
        background = [
            "bg-gradient-to-r from-ls-0 dark:from-ds-900 to-[50px] hover:to-ls-100 dark:hover:to-ds-800",
            isOdd ? "to-ls-50 dark:to-ds-800/20" : "to-ls-0 dark:to-ds-900",
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