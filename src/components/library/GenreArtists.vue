<template>
    <div v-if="artists?.length" class="min-h-0 flex flex-col">
        <div class="min-h-0 flex flex-col">
            <InputText class="mb-8 w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                icon="filter_alt" autofocus clearable />
            <div v-if="filteredArtists.length" ref="viewport" class="-m-4 p-4 overflow-y-scroll">
                <div v-for="artist of filteredArtists" v-text="artist.name" />
            </div>
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
        Something went wrong while listing artists.
    </Error>

    <div v-else-if="artists" class="grow flex mt-40 justify-center text-center">
        <BlankStateFiller icon="person_off">
            No artists found.
        </BlankStateFiller>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRaw, useTemplateRef } from 'vue';
import { useAsyncState, useScroll, watchImmediate, watchThrottled } from '@vueuse/core';

import { ArtistHeader } from '@/api/dto';
import { getGenreArtists } from '@/api/endpoints';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import Spinner from '@/components/basic/Spinner.vue';

// TODO persistence
// TODO dark mode

const props = defineProps<{ name: string }>();

const filter = ref("");

const { state: artists, isLoading, error, execute: fetchArtists } = useAsyncState(getGenreArtists, undefined, { immediate: false, resetOnExecute: true });

const viewport = useTemplateRef("viewport");
const { y: scrollY } = useScroll(viewport);

const filteredArtists = computed(() => {
    if (!artists.value) {
        return [];
    }
    const query = filter.value.toLowerCase();
    return artists.value.filter(a => {
        if (!query.length) {
            return true;
        }
        if (a.name.toLowerCase().includes(query)) {
            return true;
        }
        return false;
    });
});

const historyStateKey = "genre";

interface State {
    artists?: ArtistHeader[],
    filter: string,
    scrollY: number,
}

watchThrottled([artists, filter, scrollY], async () => {
    const state: State = {
        artists: toRaw(artists.value),
        filter: filter.value,
        scrollY: scrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

watchImmediate(() => props.name, () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (!state?.artists?.length) {
        fetchArtists(0, props.name);
        return;
    }
    artists.value = state.artists;
    filter.value = state.filter;
    nextTick(() => {
        scrollY.value = state.scrollY;
    });
});

</script>