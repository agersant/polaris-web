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
        </PageTitle>

        <div class="grow min-h-0 flex flex-col">

            <div v-if="genre" class="min-h-0 flex flex-col">
                <div v-if="viewMode == 'albums'" class="min-h-0 flex flex-col">
                    <InputText class="mb-8 w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                        icon="filter_alt" autofocus clearable />
                    <AlbumGrid ref="album-grid" class="-m-4 p-4 overflow-y-scroll" :albums="filteredAlbums"
                        :num-columns="5" :show-artists="true">
                    </AlbumGrid>
                </div>
            </div>

        </div>
    </div>
</template>


<script setup lang="ts">
import { computed, nextTick, ref, Ref, toRaw, useTemplateRef } from 'vue';
import { useAsyncState, useScroll, watchImmediate, watchThrottled, whenever } from '@vueuse/core';

import { Genre } from '@/api/dto';
import { getGenre } from '@/api/endpoints';
import InputText from '@/components/basic/InputText.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import SwitchText from '@/components/basic/SwitchText.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';

// TODO Error state
// TODO Load state
// TODO overview main artists (by song count)
// TODO overview related genres (by correlation)
// TODO overview recently added albums
// TODO all artists
// TODO persistence
// TODO dark mode

const props = defineProps<{ name: string }>();

type ViewMode = "overview" | "artists" | "albums";
const viewMode: Ref<ViewMode> = ref("overview");

const filter = ref("");

const { state: genre, isLoading, error, execute: fetchGenre } = useAsyncState(getGenre, undefined, { immediate: false, resetOnExecute: true });

const grid = useTemplateRef("album-grid");
const { y: albumGridScrollY } = useScroll(() => grid.value?.$el);
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
    if (!genre.value) {
        return [];
    }
    const query = filter.value.toLowerCase();
    return genre.value.albums.filter(a => {
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

const historyStateKey = "genre";

interface State {
    genre?: Genre,
    filter: string,
    viewMode: ViewMode,
    albumGridScrollY: number,
}

watchThrottled([genre, viewMode, filter, albumGridScrollY], async () => {
    const state: State = {
        genre: toRaw(genre.value),
        filter: filter.value,
        viewMode: viewMode.value,
        albumGridScrollY: albumGridScrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

watchImmediate(() => props.name, () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (state?.genre?.name != props.name) {
        fetchGenre(0, props.name);
        return;
    }
    genre.value = state.genre;
    filter.value = state.filter;
    viewMode.value = state.viewMode;
    autoScrollGrid.value = state.albumGridScrollY;
});

</script>
