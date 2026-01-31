<template>
    <div class="flex flex-col">
        <PageHeader :title="name" :actions="pageActions" />

        <Tabs v-model="viewMode" :tabs="viewModes" />

        <div class="grow min-h-0 flex flex-col">
            <router-view v-slot="{ Component }">
                <component :is="Component" :name="name" />
            </router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ComputedRef, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getGenreSongs } from '@/api/endpoints';
import PageHeader from '@/components/basic/PageHeader.vue';
import Tabs from '@/components/basic/Tabs.vue';
import { makeGenreURL } from '@/router';
import { usePlaybackStore } from '@/stores/playback';

const router = useRouter();
const playback = usePlaybackStore();

const props = defineProps<{ name: string }>();

const pageActions = [
    { label: "Play All", icon: "play_arrow", action: playAll },
    { label: "Queue All", icon: "playlist_add", action: queueAll },
];

type ViewMode = "overview" | "artists" | "albums";

const viewModes = [
    { label: 'Overview', value: 'overview' },
    { label: 'Artists', value: 'artists' },
    { label: 'Albums', value: 'albums' }
];

const viewMode: ComputedRef<ViewMode> = computed({
    get: () => {
        const path = router.currentRoute.value.path;
        if (path.endsWith("/albums")) {
            return "albums"
        } else if (path.endsWith("/artists")) {
            return "artists"
        } else {
            return "overview";
        }
    },
    set: (value) => {
        switch (value) {
            case "overview":
                router.push(makeGenreURL(props.name));
                break;
            case "albums":
                router.push(`${makeGenreURL(props.name)}/albums`);
                break;
            case "artists":
                router.push(`${makeGenreURL(props.name)}/artists`);
                break;
        }
    },
});

watch(viewMode, (viewMode) => {
    switch (viewMode) {
        case "overview":
            router.push(makeGenreURL(props.name));
            break;
        case "albums":
            router.push(`${makeGenreURL(props.name)}/albums`);
            break;
        case "artists":
            router.push(`${makeGenreURL(props.name)}/artists`);
            break;
    }
});

async function playAll() {
    const songs = (await getGenreSongs(props.name)).paths;
    playback.clear();
    playback.stop();
    playback.queueTracks(songs);
}

async function queueAll() {
    const songs = (await getGenreSongs(props.name)).paths;
    playback.queueTracks(songs);
}

</script>
