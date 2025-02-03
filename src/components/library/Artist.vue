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
            <div ref="viewport" class="relative grow -m-4 p-4 mb-0 overflow-y-auto flex flex-col gap-8">

                <Switch class="absolute mt-0.5 top-4 right-4" v-model="preferences.artistDisplayMode" :items="[
                    { icon: 'apps', value: 'grid5' },
                    { icon: 'grid_view', value: 'grid3' },
                    { icon: 'timeline', value: 'timeline' }
                ]" />

                <div v-if="preferences.artistDisplayMode != 'timeline' && mainWorks?.length">
                    <SectionTitle label="Main Releases" class="h-10">
                        <ButtonGroup>
                            <Button icon="play_arrow" severity="secondary" size="sm" @click="play(mainWorks)" />
                            <Button icon="playlist_add" severity="secondary" size="sm" @click="queue(mainWorks)" />
                        </ButtonGroup>
                    </SectionTitle>
                    <AlbumGrid :albums="mainWorks" :num-columns="numColumns" :show-artists="false" />
                </div>

                <div v-if="preferences.artistDisplayMode != 'timeline' && otherWorks?.length">
                    <SectionTitle label="Featured On" class="h-10">
                        <ButtonGroup>
                            <Button icon="play_arrow" severity="secondary" size="sm" @click="play(otherWorks)" />
                            <Button icon="playlist_add" severity="secondary" size="sm" @click="queue(otherWorks)" />
                        </ButtonGroup>
                    </SectionTitle>
                    <AlbumGrid :albums="otherWorks" :num-columns="numColumns" :show-artists="true" />
                </div>

                <Timeline v-if="preferences.artistDisplayMode == 'timeline'" :artist="artist.name"
                    :albums="artist.albums" class="m-16" />

            </div>

            <!-- TODO orphaned song support -->

        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing releases.
        </Error>

    </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";

import { AlbumHeader, AlbumKey } from "@/api/dto";
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
import { saveScrollState, useHistory } from "@/history";
import { makeGenreURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";
import { usePreferencesStore } from "@/stores/preferences";

const router = useRouter();
const playback = usePlaybackStore();
const preferences = usePreferencesStore();

const props = defineProps<{
    name: string,
}>();

const { state: artist, isLoading, error, execute: fetchArtist } = useAsyncState(
    (name: string) => getArtist(name),
    undefined,
    { immediate: false, resetOnExecute: true }
);

const numColumns = computed(() => {
    switch (preferences.artistDisplayMode) {
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

if (!useHistory("artist", [artist, saveScrollState(viewport)])) {
    fetchArtist(0, props.name);
}

watch(() => props.name, () => {
    fetchArtist(0, props.name);
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
