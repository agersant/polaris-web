<template>
    <div class="relative grow h-full min-w-0 rounded-sm flex items-center whitespace-nowrap text-xs" :class="rowClass">
        <div v-if="!compact" class="basis-10 h-10 mr-3 shrink-0 flex items-center">
            <AlbumArt :url="artworkURL" />
        </div>
        <div class="grow basis-0 pr-4 text-ellipsis" :class="{ 'overflow-hidden': song }">
            <span v-if="song" v-text="formatTrackContext(song)" />
            <div v-else class="-mr-8 bg-black/5 dark:bg-white/5 h-3 rounded-full" />
        </div>
        <div class="basis-8 shrink-0 text-right mr-1">
            <span v-if="song && song.track_number"> {{ formatTrackNumber(song) }}.</span>
        </div>
        <div class="grow basis-0 pr-4 overflow-hidden text-ellipsis">
            <span v-if="song">
                {{ formatTitle(song) }}
                <span :class="selected ? '' : 'text-ls-400 dark:text-ds-600'"
                    v-if="song.artists && song.album_artists && !equals(song.artists, song.album_artists)">
                    ({{ formatArtists(song.artists) }})
                </span>
            </span>
            <div v-else class="bg-black/5 dark:bg-white/5 h-3 rounded-full" />
        </div>
        <div class="basis-16 shrink-0 text-right">
            <span v-if="song">{{ formatTrackDuration(song) }}</span>
            <div v-else class="bg-black/5 dark:bg-white/5 h-3 rounded-full" />
        </div>
    </div>
</template>

<script setup lang="ts">
import equals from "array-equal"
import { computed } from 'vue';

import { Song } from "@/api/dto";
import { makeThumbnailURL } from "@/api/endpoints";
import AlbumArt from '@/components/AlbumArt.vue';
import { formatArtists, formatDuration, formatTitle, formatTrackNumber } from '@/format';
import { useSongsStore } from '@/stores/songs';

const songs = useSongsStore();

const props = defineProps<{
    path: string,
    index: number,
    compact: boolean,
    selected: boolean,
    focused: boolean,
    isCurrent?: boolean,
}>();

const song = computed(() => songs.cache.get(props.path));

const artworkURL = computed(() => song.value?.artwork ? makeThumbnailURL(song.value.artwork, "tiny") : undefined);

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

    let text;
    if (props.isCurrent && props.selected) {
        text = "text-accent-700 dark:text-accent-100";
    } else if (props.selected) {
        text = "text-accent-700 dark:text-accent-200";
    } else if (props.isCurrent) {
        text = "text-ls-700 dark:text-ds-0";
    } else {
        text = "text-ls-700 dark:text-ds-400";
    }

    return [
        text,
        background,
        props.isCurrent ? "font-semibold" : "",
        props.compact ? "px-3" : "pr-2",
        !props.compact && props.selected ? "-ml-2 pl-2" : "",
        props.focused ? "outline-1 outline-dotted outline-accent-500 -outline-offset-1" : "",
        "mr-2"
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