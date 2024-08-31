<template>
    <div class="flex gap-4 items-center justify-end">
        <Spinner v-if="debouncedBuffering" />
        <div class="flex gap-2 items-center">

            <span @click="skipPrevious" class="material-icons-round w-9 h-9 mb-0.5
                text-3xl text-center
                rounded-lg border border-ls-0
                active:py-px" :class="playlist.hasPrevious()
                    ? 'cursor-pointer text-ls-900 hover:border-ls-200 hover:bg-ls-50'
                    : 'active:pointer-events-none cursor-not-allowed text-ls-400'">
                skip_previous
            </span>

            <div @click="togglePlayback" class="cursor-pointer material-icons-round py-1 w-12 h-12 
                text-4xl text-center text-ls-0
                rounded-full bg-accent-600 
                hover:bg-accent-500 hover:ring-2
                ring-accent-500 ring-offset-4
                active:pt-[5px]">
                {{ paused ? 'play_arrow' : 'pause' }}
            </div>

            <span @click="skipNext" class="material-icons-round w-9 h-9 mb-0.5
                text-3xl text-center
                rounded-lg border border-ls-0
                active:pt-px" :class="playlist.hasNext()
                    ? 'cursor-pointer text-ls-900 hover:border-ls-200 hover:bg-ls-50'
                    : 'active:pointer-events-none cursor-not-allowed text-ls-400'">
                skip_next
            </span>

        </div>

        <div class="flex items-center gap-0.5">
            <span @click="toggleMute" class="cursor-pointer material-icons-round"
                :class="isQuiet ? '-translate-x-0.5 text-ls-700' : 'text-ls-900'">
                {{ isQuiet ? 'volume_mute' : 'volume_down' }}
            </span>
            <Slider class="w-20" v-model="volume" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";

import Slider from "@/components/basic/Slider.vue";
import Spinner from "@/components/basic/Spinner.vue";
import { usePlaylistStore } from "@/stores/playlist";

const playlist = usePlaylistStore();

const props = defineProps<{
    buffering: boolean,
    paused: boolean,
}>();

const volume = defineModel<number>("volume", { required: true, });

const emit = defineEmits<{
    "pause": [],
    "play": [],
    "restart": [],
}>();

const debouncedVolume = refDebounced(volume, 100);
const savedVolume = ref(volume.value);
const isQuiet = computed(() => volume.value == 0);

watch(debouncedVolume, () => {
    if (debouncedVolume.value > 0) {
        savedVolume.value = debouncedVolume.value;
    }
});

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

function toggleMute() {
    if (volume.value > 0) {
        volume.value = 0;
    } else {
        volume.value = savedVolume.value;
    }
}
</script>
