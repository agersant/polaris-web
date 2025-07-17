<template>
    <div class="flex flex-col">
        <PageTitle :label="name">
            <template #left>
                <SwitchText class="ml-6 pl-6 border-l border-ls-200 dark:border-ds-700" v-model="viewMode" :items="[
                    { label: 'Overview', value: 'overview' },
                    { label: 'Artists', value: 'artists' },
                    { label: 'Albums', value: 'albums' }
                ]" />
            </template>
            <template #right>
                <div class="ml-8 flex gap-2">
                    <Button label="Play All" severity="secondary" icon="play_arrow" @click="playAll" />
                    <Button label="Queue All" severity="secondary" icon="playlist_add" @click="queueAll" />
                </div>
            </template>
        </PageTitle>

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
import Button from '@/components/basic/Button.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import SwitchText from '@/components/basic/SwitchText.vue';
import { makeGenreURL } from '@/router';
import { usePlaybackStore } from '@/stores/playback';

const router = useRouter();
const playback = usePlaybackStore();

const props = defineProps<{ name: string }>();

type ViewMode = "overview" | "artists" | "albums";

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
