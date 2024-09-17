<template>

    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Albums">
            <template #left>
                <SwitchText class="ml-6 pl-6 border-l border-ls-200 dark:border-ds-700" v-model="viewFilter" :items="[
                    { label: 'Recent', value: 'recent' },
                    { label: 'Random', value: 'random' },
                    { label: 'All', value: 'all' },
                ]" />
            </template>
        </PageTitle>

        <div v-if="albums.length" class="grow min-h-0 flex flex-col">

            <div class="mb-8 flex items-center justify-between">
                <!-- TODO tooltips -->
                <!-- TODO clear filter icon -->
                <InputText class="w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                    icon="filter_alt" autofocus />
                <!-- TODO tooltips -->
                <Switch v-model="displayMode" :items="[
                    { icon: 'apps', value: 'grid5' },
                    { icon: 'grid_view', value: 'grid3' },
                ]" />
            </div>

            <AlbumGrid class="-m-4 p-4 overflow-y-scroll" :albums="filtered" :num-columns="numColumns"
                :show-artists="true" />
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
import { computed, Ref, ref, watch } from "vue";
import { useAsyncState } from "@vueuse/core";

import { getAlbums } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import Switch from "@/components/basic/Switch.vue";
import AlbumGrid from "@/components/library/AlbumGrid.vue";
import { AlbumHeader } from "@/api/dto";

/* TODO
    dark mode
    persistence
    recent
    random
    clickable artists
    preserve scrolling when display mode changes
*/

const albums: Ref<AlbumHeader[]> = ref([]);

const { state: fetchedAlbums, isLoading, isReady, error } = useAsyncState(getAlbums(), []);
watch(fetchedAlbums, (a) => {
    if (!albums.value.length) {
        albums.value = a;
    }
});

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
const viewFilter: Ref<ViewMode> = ref("recent");

const filter = ref("");
const filtered = computed(() => {
    const query = filter.value.toLowerCase();
    return albums.value.filter(a => {
        if (!query.length) {
            return true;
        }
        return a.name.toLowerCase().includes(query);
    });
});

</script>
