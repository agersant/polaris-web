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

            <InputText v-if="viewMode == 'all'" class="mb-8 w-80" v-model="filter" id="filter" name="filter"
                placeholder="Filter" icon="filter_alt" autofocus clearable />

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
            <BlankStateFiller icon="music_off" suggestion="collectionSettings">
                No albums found.
            </BlankStateFiller>
        </div>

    </div>

</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, ShallowRef, toRaw, useTemplateRef, watch } from "vue";
import { useAsyncState, useElementSize, useScroll, watchPausable, watchThrottled, whenever } from "@vueuse/core";

import { AlbumHeader } from "@/api/dto";
import { getAlbums, getRandomAlbums, getRecentAlbums } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import AlbumGrid from "@/components/library/AlbumGrid.vue";

const numColumns = ref(5);

type ViewMode = "recent" | "random" | "all";
const viewMode: Ref<ViewMode> = ref("recent");

const albums: ShallowRef<AlbumHeader[]> = ref([]);
const fetchedAll = ref(false);
const seed = ref(generateSeed());

const { state: fetchedAlbums, isLoading, isReady, error, execute: fetchAlbums } = useAsyncState(async () => {
    switch (viewMode.value) {
        case "all":
            return getAlbums();
        case "recent":
            return getRecentAlbums(albums.value.length, numColumns.value * 20);
        case "random":
            return getRandomAlbums(seed.value, albums.value.length, numColumns.value * 20);
    }
}, [], { immediate: false });

const grid = useTemplateRef("grid");
const { y: scrollY } = useScroll(() => grid.value?.$el);
const { height: viewportHeight } = useElementSize(grid);
const gridContentHeight = computed(() => grid.value?.contentHeight);

const needsMoreAlbums = computed(() => {
    if (isLoading.value || fetchedAll.value || !gridContentHeight.value || viewMode.value == "all") {
        return false;
    }
    return Math.abs(scrollY.value + viewportHeight.value - gridContentHeight.value) < 100;
});

watchThrottled(needsMoreAlbums, () => {
    if (needsMoreAlbums.value) {
        fetchAlbums();
    }
}, { throttle: 200 });

const autoScroll: Ref<number | undefined> = ref(undefined);
whenever(() => autoScroll.value && gridContentHeight.value && autoScroll.value <= gridContentHeight.value, () => {
    const top = autoScroll.value;
    autoScroll.value = undefined;
    nextTick(() => {
        scrollY.value = top || 0;
    });
});

const viewModeWatch = watchPausable(viewMode, () => {
    albums.value = [];
    fetchedAll.value = false;
    fetchAlbums();
});

watch(fetchedAlbums, () => {
    fetchedAll.value = !fetchedAlbums.value.length;
    switch (viewMode.value) {
        case "all":
            albums.value = fetchedAlbums.value;
            break;
        case "recent":
        case "random":
            albums.value = [...toRaw(albums.value), ...fetchedAlbums.value];
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

const historyStateKey = "albums";

interface State {
    albums: AlbumHeader[],
    filter: string,
    viewMode: ViewMode,
    seed: number,
    scrollY: number,
}

watchThrottled([albums, filter, viewMode, seed, scrollY], async () => {
    const state: State = {
        albums: toRaw(albums.value),
        filter: filter.value,
        viewMode: viewMode.value,
        seed: seed.value,
        scrollY: scrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

onMounted(() => {
    const state = history.state[historyStateKey] as State | undefined;
    if (!state || !state.albums.length) {
        fetchAlbums();
        return;
    }
    viewModeWatch.pause();
    viewMode.value = state.viewMode;
    albums.value = state.albums;
    filter.value = state.filter;
    seed.value = state.seed;
    autoScroll.value = state.scrollY;
    nextTick(() => viewModeWatch.resume());
});

function generateSeed() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
</script>
