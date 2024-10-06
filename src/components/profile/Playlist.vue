<template>
    <div class="flex flex-col">
        <PageTitle :label="name">
            <template #left>
                <span v-if="playlist" class="ml-4 italic text-xs text-ls-500 dark:text-ds-500"
                    v-text="formatLongDuration(playlist.duration)" />
            </template>
            <template #right>
                <div class="ml-8 flex gap-2">
                    <Button label="Play All" severity="secondary" icon="play_arrow" @click="play" />
                    <Button label="Delete" severity="danger" icon="delete" @click="deletePlaylist" />
                </div>
            </template>
        </PageTitle>

        <div v-if="songs.length" class="mb-8 flex justify-between">
            <div class="basis-0 grow max-h-6 mr-6 mt-1.5 overflow-hidden flex flex-wrap gap-2">
                <Badge v-for="genre of genres" :label="genre" :auto-color="true" @click="onGenreClicked(genre)" />
            </div>
            <Switch v-model="listMode"
                :items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
        </div>

        <div v-show="songs?.length" class="flex flex-col min-h-0">
            <SongList v-model="songs" :compact="listMode == 'compact'" invert-stripes />
        </div>

        <div v-if="songs?.length" />

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while retrieving this playlist.
        </Error>

        <div v-else class="grow flex items-start mt-40 justify-center text-center">
            <BlankStateFiller icon="music_off">
                This playlist is empty.
            </BlankStateFiller>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { watchImmediate } from '@vueuse/core';
import { useRouter } from 'vue-router';

import { getPlaylist } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Button from '@/components/basic/Button.vue';
import Error from '@/components/basic/Error.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import Switch from '@/components/basic/Switch.vue';
import SongList from '@/components/SongList.vue';
import { makeGenreURL } from '@/router';
import { formatLongDuration } from '@/format';
import { usePlaybackStore } from '@/stores/playback';
import { usePlaylistsStore } from '@/stores/playlists';

const router = useRouter();
const playback = usePlaybackStore();
const playlists = usePlaylistsStore();

const props = defineProps<{ name: string }>();

const isLoading = ref(false);
const error = ref(false);

// TODO save to preferences
const listMode = ref("compact");

const songs = computed(() => playlist.value?.songs.paths || []);

const genres = computed(() => {
    let entries = Object.entries(playlist.value?.num_songs_by_genre || {});
    let displayGenres = entries.map(([genre, count]) => ({ genre, count }));
    displayGenres.sort((a, b) => a.count - b.count).reverse();
    return displayGenres.map(({ genre }) => genre);
});

watchImmediate(() => props.name, async () => {
    try {
        isLoading.value = true;
        await playlists.fetchPlaylist(props.name);
    } catch (e) {
        error.value = true;
    }
    isLoading.value = false;
});

const playlist = computed(() => playlists.playlists.get(props.name));

function onGenreClicked(name: string) {
    router.push(makeGenreURL(name));
}

async function play() {
    const songs = await listSongs();
    playback.clear();
    playback.queueTracks(songs);
    playback.setName(props.name);
    playback.next();
}

async function deletePlaylist() {
    await playlists.deletePlaylist(props.name);
    router.push("/playlists");
}

async function listSongs() {
    if (playlist.value) {
        return playlist.value.songs.paths;
    }
    return (await getPlaylist(props.name)).songs.paths;
}
</script>
