<template>
    <div class="flex flex-col">
        <PageTitle :label="name">
            <template #right>
                <div class="basis-0 grow max-h-6 ml-6 mt-1.5 overflow-hidden flex flex-wrap justify-end gap-2">
                    <Badge v-for="genre of genres" :label="genre" :auto-color="true" @click="onGenreClicked(genre)" />
                </div>
            </template>
        </PageTitle>

        <div v-if="artist" class="flex flex-col min-h-0">
            <div ref="viewport" class="relative grow -m-4 p-4 mb-0 overflow-y-scroll flex flex-col gap-8">

                <Switch class="absolute mt-0.5 top-4 right-4" v-model="displayMode" :items="[
                    { icon: 'apps', value: 'grid5' },
                    { icon: 'grid_view', value: 'grid3' },
                    { icon: 'timeline', value: 'timeline' }
                ]" />

                <div v-if="displayMode != 'timeline' && mainWorks?.length">
                    <SectionTitle label="Main Releases" class="h-10">
                        <ButtonGroup>
                            <Button icon="play_arrow" severity="secondary" size="sm" @click="play(mainWorks)" />
                            <Button icon="playlist_add" severity="secondary" size="sm" @click="queue(mainWorks)" />
                        </ButtonGroup>
                    </SectionTitle>
                    <AlbumGrid :albums="mainWorks" :num-columns="numColumns" :show-artists="false" />
                </div>

                <div v-if="displayMode != 'timeline' && otherWorks?.length">
                    <SectionTitle label="Featured On" class="h-10">
                        <ButtonGroup>
                            <Button icon="play_arrow" severity="secondary" size="sm" @click="play(otherWorks)" />
                            <Button icon="playlist_add" severity="secondary" size="sm" @click="queue(otherWorks)" />
                        </ButtonGroup>
                    </SectionTitle>
                    <AlbumGrid :albums="otherWorks" :num-columns="numColumns" :show-artists="true" />
                </div>

                <Timeline v-if="displayMode == 'timeline'" :artist="artist.name" :albums="artist.albums" class="m-16" />

            </div>

            <!-- TODO orphaned song support -->

        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing releases.
        </Error>

    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, Ref, ref, toRaw, useTemplateRef } from "vue";
import { useAsyncState, useScroll, watchImmediate, watchThrottled } from "@vueuse/core";
import { useRouter } from "vue-router";

import { AlbumHeader, AlbumKey, Artist } from "@/api/dto";
import { getAlbum, getArtist, } from "@/api/endpoints";
import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import ButtonGroup from '@/components/basic/ButtonGroup.vue';
import Error from '@/components/basic/Error.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Switch from '@/components/basic/Switch.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';
import Timeline from '@/components/library/Timeline.vue';
import { makeGenreURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";

const router = useRouter();
const playback = usePlaybackStore();

const props = defineProps<{
    name: string,
}>();

const { state: artist, isLoading, error, execute: fetchArtist } = useAsyncState(
    (name: string) => getArtist(name),
    undefined,
    { immediate: false, resetOnExecute: true }
);

type DisplayMode = "grid5" | "grid3" | "timeline";

// TODO save in preferences
const displayMode: Ref<DisplayMode> = ref("grid5");

const numColumns = computed(() => {
    switch (displayMode.value) {
        case "grid5": return 5;
        case "grid3": return 3;
        case "timeline": return 1;
    };
});

const genres = computed(() => {
    let entries = Object.entries(artist.value?.num_songs_by_genre || {});
    let displayGenres = entries.map(([genre, count]) => ({ genre, count }));
    displayGenres.sort((a, b) => a.count - b.count).reverse();
    return displayGenres.map(({ genre }) => genre);
});

const mainWorks = computed(() => {
    if (!artist.value) {
        return undefined;
    }

    let works = [];
    for (const album of artist.value.albums) {
        if (album.main_artists.includes(artist.value.name)) {
            works.push(album);
        } else {
            const numContributions = album.contributions.filter(c => c.composer || c.lyricist || c.performer).length;
            if (numContributions >= album.contributions.length / 2) {
                works.push(album);
            }
        }
    }

    return works;
});

const otherWorks = computed(() => {
    const albums = artist.value?.albums;
    const main = mainWorks.value;
    if (!albums || !main) {
        return undefined;
    }
    return albums.filter(a => !main.includes(a));
});

const viewport = useTemplateRef("viewport");
const { y: scrollY } = useScroll(viewport);

const historyStateKey = "artist";

interface State {
    artist?: Artist,
    scrollY: number,
}

watchThrottled([artist, scrollY], async () => {
    const state: State = {
        artist: toRaw(artist.value),
        scrollY: scrollY.value || 0,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

watchImmediate(() => props.name, () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (state?.artist?.name != props.name) {
        fetchArtist(0, props.name);
        return;
    }
    artist.value = state.artist;
    nextTick(() => {
        // TODO Fix not-working savestate
        scrollY.value = state.scrollY;
    })
});

function onGenreClicked(name: string) {
    router.push(makeGenreURL(name));
}

async function play(albums: AlbumHeader[]) {
    const songs = await listSongs(albums);
    playback.clear();
    playback.queueTracks(songs);
    playback.next();
}

async function queue(albums: AlbumHeader[]) {
    const songs = await listSongs(albums);
    playback.queueTracks(songs);
}

async function listSongs(albums: AlbumHeader[]) {
    return (
        await Promise.all(albums.map((a) => {
            const key: AlbumKey = {
                name: a.name,
                artists: a.main_artists,
            };
            return getAlbum(key).then(album => album.songs.map(s => s.path));
        }))
    ).flat();
}

</script>
