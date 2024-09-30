<template>
    <div v-if="albums?.length" class="min-h-0 flex flex-col">
        <div class="min-h-0 flex flex-col">
            <InputText class="mb-8 w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                icon="filter_alt" autofocus clearable />
            <AlbumGrid v-if="filteredAlbums.length" ref="album-grid" class="-m-4 p-4 overflow-y-scroll"
                :albums="filteredAlbums" :num-columns="5" :show-artists="true">
            </AlbumGrid>
            <div v-else class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="filter_alt_off">
                    No albums match this filter.
                </BlankStateFiller>
            </div>
        </div>
    </div>

    <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
        <Spinner class="text-ls-700 dark:text-ds-400" />
    </div>

    <Error v-else-if="error">
        Something went wrong while listing albums.
    </Error>

    <div v-else-if="albums" class="grow flex mt-40 justify-center text-center">
        <BlankStateFiller icon="music_off">
            No albums found.
        </BlankStateFiller>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, Ref, ref, toRaw, useTemplateRef } from 'vue';
import { useAsyncState, useScroll, watchImmediate, watchThrottled, whenever } from '@vueuse/core';

import { AlbumHeader } from '@/api/dto';
import { getGenreAlbums } from '@/api/endpoints';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';

const props = defineProps<{ name: string }>();

const filter = ref("");

const { state: albums, isLoading, error, execute: fetchAlbums } = useAsyncState(getGenreAlbums, undefined, { immediate: false, resetOnExecute: true });

const grid = useTemplateRef("album-grid");
const { y: scrollY } = useScroll(() => grid.value?.$el);
const gridContentHeight = computed(() => grid.value?.contentHeight);

const autoScrollGrid: Ref<number | undefined> = ref(undefined);
whenever(() => autoScrollGrid.value && gridContentHeight.value && autoScrollGrid.value <= gridContentHeight.value, () => {
    const top = autoScrollGrid.value;
    autoScrollGrid.value = undefined;
    nextTick(() => {
        grid.value?.$el.scrollTo({ top });
    });
});

const filteredAlbums = computed(() => {
    if (!albums.value) {
        return [];
    }
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

const historyStateKey = "genre-albums";

interface State {
    albums?: AlbumHeader[],
    filter: string,
    scrollY: number,
}

watchThrottled([albums, filter, scrollY], async () => {
    const state: State = {
        albums: toRaw(albums.value),
        filter: filter.value,
        scrollY: scrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

watchImmediate(() => props.name, () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (!state?.albums?.length) {
        fetchAlbums(0, props.name);
        return;
    }
    albums.value = state.albums;
    filter.value = state.filter;
    autoScrollGrid.value = state.scrollY;
});

</script>