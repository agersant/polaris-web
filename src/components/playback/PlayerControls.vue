<template>
    <div class="flex gap-4 items-center justify-end">
        <Spinner v-if="debouncedBuffering" />
        <div class="flex gap-2 items-center">
            <span @click="skipPrevious" class="material-icons-round text-3xl"
                :class="playlist.hasPrevious() ? 'cursor-pointer text-ls-900' : 'active:pointer-events-none cursor-not-allowed text-ls-400'">skip_previous</span>
            <div @click="togglePlayback"
                class="cursor-pointer material-icons-round text-4xl rounded-full bg-accent-600 text-ls-0 text-center py-1 w-12 h-12 hover:bg-accent-500">
                {{ paused ? 'play_arrow' : 'pause' }}
            </div>
            <span @click="skipNext" class="material-icons-round text-3xl"
                :class="playlist.hasNext() ? 'cursor-pointer text-ls-900' : 'active:pointer-events-none cursor-not-allowed text-ls-400'">skip_next</span>
        </div>
        <div class="flex items-center">
            <!-- TODO volume interactions -->
            <span class="cursor-pointer material-icons-round">{{ muted ? 'volume_off' : 'volume_down' }}</span>
            <div class="w-28 h-1.5 bg-accent-600 rounded-full" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { refDebounced } from "@vueuse/core";

import Spinner from "@/components/basic/Spinner.vue";
import { usePlaylistStore } from "@/stores/playlist";

const playlist = usePlaylistStore();

const props = defineProps<{
    buffering: boolean,
    muted: boolean,
    paused: boolean,
    volume: number,
}>();

const emit = defineEmits<{
    "pause": [],
    "play": [],
    "restart": [],
}>();

const bufferingRef = computed(() => props.buffering);
const debouncedBuffering = refDebounced(bufferingRef, 100);

function togglePlayback() {
    if (props.paused) {
        emit("play");
    } else {
        emit("pause");
    }
}

async function skipPrevious() {
    const oldTrack = playlist.currentTrack;
    const newTrack = await playlist.previous();
    if (newTrack?.key == oldTrack?.key) {
        emit("restart");
    }
}

async function skipNext() {
    const oldTrack = playlist.currentTrack;
    const newTrack = await playlist.next();
    if (newTrack?.key == oldTrack?.key) {
        emit("restart");
    }
}
</script>
