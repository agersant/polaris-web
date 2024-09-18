<template>

    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Albums">
            <template #left>
                <SwitchText class="ml-6 pl-6 border-l border-ls-200 dark:border-ds-700" v-model="viewMode" :items="[
                    { label: 'Recently Added', value: 'recent' },
                    { label: 'Random', value: 'random' },
                    { label: 'All', value: 'all' },
                ]" />
            </template>
        </PageTitle>

        <div v-if="albums.length" class="grow min-h-0 flex flex-col">

            <div class="mb-8 flex items-center justify-between">
                <!-- TODO tooltips -->
                <!-- TODO clear filter icon -->
                <Button v-if="viewMode == 'random'" severity="secondary" size="lg" label="Play Anything"
                    icon="auto_awesome" @click="playAnything" />
                <InputText v-else class="w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                    icon="filter_alt" autofocus />
                <!-- TODO tooltips -->
                <Switch v-model="displayMode" :items="[
                    { icon: 'apps', value: 'grid5' },
                    { icon: 'grid_view', value: 'grid3' },
                ]" />
            </div>

            <div v-if="!filtered.length" class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="filter_alt_off">
                    No albums match this filter.
                </BlankStateFiller>
            </div>

            <AlbumGrid ref="grid" class="-m-4 p-4 overflow-y-scroll" :albums="filtered" :num-columns="numColumns"
                :show-artists="true">
                <template #footer>
                    <div v-if="isLoading" class="flex p-8 items-start justify-center">
                        <Spinner class="text-ls-700 dark:text-ds-400" />
                    </div>
                </template>
            </AlbumGrid>

        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing albums.
        </Error>

        <div v-else-if="isReady && !albums.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="person_off" suggestion="collectionSettings">
                No albums found.
            </BlankStateFiller>
        </div>

    </div>

</template>

<script setup lang="ts">
import { computed, Ref, ref, useTemplateRef, watch } from "vue";
import { useAsyncState, useScroll, whenever } from "@vueuse/core";

import { AlbumHeader } from "@/api/dto";
import { getAlbum, getAlbums, getRandomAlbums, getRecentAlbums } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Button from "@/components/basic/Button.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import Switch from "@/components/basic/Switch.vue";
import AlbumGrid from "@/components/library/AlbumGrid.vue";
import { usePlaybackStore } from "@/stores/playback";

const playback = usePlaybackStore();

/* TODO
    dark mode
    persistence
    random
    clickable artists
    preserve scrolling when display mode changes
*/

// TODO save in preferences
type DisplayMode = "grid5" | "grid3";
const displayMode: Ref<DisplayMode> = ref("grid5");
const numColumns = computed(() => {
    switch (displayMode.value) {
        case "grid5": return 5;
        case "grid3": return 3;
    };
});

type ViewMode = "recent" | "random" | "all";
const viewMode: Ref<ViewMode> = ref("recent");

const albums: Ref<AlbumHeader[]> = ref([]);

const { state: fetchedAlbums, isLoading, isReady, error, execute: fetchAlbums } = useAsyncState(async () => {
    switch (viewMode.value) {
        case "all":
            return getAlbums();
        case "recent":
            return getRecentAlbums(albums.value.length, numColumns.value * 20);
        case "random":
            return getRandomAlbums(0, albums.value.length, numColumns.value * 20);
    }
}, []);

const grid = useTemplateRef("grid");
const { arrivedState } = useScroll(() => grid.value?.$el);

whenever(() => arrivedState.bottom, () => {
    if (viewMode.value != "all" && !isLoading.value) {
        fetchAlbums();
    }
});

watch(viewMode, () => {
    albums.value = [];
    fetchAlbums();
});

watch(fetchedAlbums, () => {
    switch (viewMode.value) {
        case "all":
            albums.value = fetchedAlbums.value;
            break;
        case "recent":
        case "random":
            albums.value.push(...fetchedAlbums.value);
            break;
    }
});

const filter = ref("");
const filtered = computed(() => {
    const query = filter.value.toLowerCase();
    return albums.value.filter(a => {
        if (!query.length) {
            return true;
        }
        if (a.name.toLowerCase().includes(query)) {
            return true;
        }
        for (const artist of a.main_artists) {
            if (artist.toLowerCase().includes(query)) {
                return true;
            }
        }
        return false;
    });
});

async function playAnything() {
    const seed = Date.now();
    const album = (await getRandomAlbums(seed, 0, 1))[0];
    const key = {
        name: album.name,
        artists: album.main_artists,
    };
    const tracks = (await getAlbum(key)).songs.map(s => s.path);
    playback.clear();
    playback.queueTracks(tracks);
    playback.next();
}
</script>
