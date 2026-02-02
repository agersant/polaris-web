<template>
    <div @dblclick="playback.play(entry)" data-pw="playlist-song" class="flex" :style="{ height: height + 'px' }">
        <!-- TODO tooltips -->
        <!-- TODO context menu -->
        <div class="basis-8 shrink-0 flex justify-center items-center" :class="!compact ? '-translate-x-2' : ''">
            <span v-if="isCurrent"
                class="material-icons-round text-ls-600 dark:text-ds-300 translate-x-1.5 xl:translate-x-0">play_arrow</span>
        </div>
        <SongListRow :path="entry.path" :compact="compact" :index="index" :selected="selected" :focused="focused"
            :is-current="isCurrent" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { PlaylistEntry, usePlaybackStore } from "@/stores/playback";
import SongListRow from '../SongListRow.vue';

const playback = usePlaybackStore();

const props = defineProps<{
    entry: PlaylistEntry,
    height: number,
    index: number,
    selected: boolean,
    focused: boolean,
    compact: boolean,
}>();

const isCurrent = computed(() => props.entry.key == playback.currentTrack?.key);
</script>
