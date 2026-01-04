<template>
    <div class="flex flex-col">
        <PageTitle :label="name">
            <template #left>
                <span v-if="playlist" class="ml-4 italic whitespace-nowrap text-xs text-ls-500 dark:text-ds-500"
                    v-text="formatLongDuration(playlist.duration)" />
            </template>
            <template #right>
                <div class="flex gap-2">
                    <Button label="Play All" severity="secondary" icon="play_arrow" @click="play" />
                    <Button label="Delete" severity="danger" icon="delete" data-pw="delete-playlist"
                        @click="deletePlaylist" />
                </div>
            </template>
        </PageTitle>

        <div v-if="songs.length" class="mb-8 flex justify-between">
            <div class="basis-0 grow max-h-6 mr-6 mt-1.5 overflow-hidden flex flex-wrap gap-2">
                <Badge v-for="genre of genres" :label="genre" :auto-color="true" @click="onGenreClicked(genre)" />
            </div>
            <Switch v-model="preferences.savedPlaylistDisplayMode"
                :items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
        </div>

        <div v-show="songs?.length" data-pw="saved-playlist-songs" class="flex flex-col min-h-0">
            <SongList v-model="songs" :compact="preferences.savedPlaylistDisplayMode == 'compact'" invert-stripes />
        </div>

        <div v-if="songs?.length" />

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner />
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
import { usePreferencesStore } from '@/stores/preferences';

const router = useRouter();
const playback = usePlaybackStore();
const playlists = usePlaylistsStore();
const preferences = usePreferencesStore();

const props = defineProps<{ name: string }>();

const isLoading = ref(false);
const error = ref(false);

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
    playback.stop();
    playback.queueTracks(songs);
    playback.setName(props.name);
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
