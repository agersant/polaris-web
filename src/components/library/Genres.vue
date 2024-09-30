<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" />

        <div v-if="genres && genres.length" class="grow min-h-0 flex flex-col">
            <InputText class="mb-8" v-model="filter" id="filter" name="filter" placeholder="Filter" icon="filter_alt"
                autofocus clearable />
            <div v-if="filtered.length" ref="viewport" class="flex flex-wrap gap-2 -mx-4 px-4 overflow-scroll">
                <Draggable v-for="genre of filtered" :make-payload="() => new DndPayloadGenre(genre.name)"
                    class="cursor-pointer !w-fit !h-fit" :key="genre.name" @click="onGenreClicked(genre)">
                    <Badge :label="genre.name" size="lg" auto-color />
                    <template #drag-preview>
                        <div class="flex items-center gap-2">
                            <span v-text="'label'" class="material-icons-round" />
                            <span v-text="genre.name" />
                        </div>
                    </template>
                </Draggable>
            </div>
            <div v-else class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="label_off">
                    No genres match this filter.
                </BlankStateFiller>
            </div>
        </div>

        <div v-else-if="genres && !genres.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="label_off">
                No genres found.
            </BlankStateFiller>
        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing genres.
        </Error>

    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRaw, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState, useScroll, watchThrottled } from '@vueuse/core';

import { GenreHeader } from '@/api/dto';
import { getGenres } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Draggable from '@/components/basic/Draggable.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import { DndPayloadGenre } from '@/dnd';
import { makeGenreURL } from '@/router';

const router = useRouter();

const viewport = useTemplateRef("viewport");
const { y: scrollY } = useScroll(viewport);

const { state: genres, isLoading, error, execute: fetchGenres } = useAsyncState(
    () => getGenres(),
    undefined,
    { immediate: false }
);

const filtered = computed(() => {
    if (!genres.value) {
        return [];
    }
    let query = filter.value.toLowerCase();
    return genres.value.filter(g => g.name.toLowerCase().includes(query));
});

const filter = ref("");

function onGenreClicked(genre: GenreHeader) {
    router.push(makeGenreURL(genre.name));
}

const historyStateKey = "genres";

interface State {
    genres?: GenreHeader[],
    filter: string,
    scrollY: number,
}

watchThrottled([genres, filter, scrollY], async () => {
    const state: State = {
        genres: toRaw(genres.value),
        filter: filter.value,
        scrollY: scrollY.value || 0,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

onMounted(async () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (!state) {
        fetchGenres();
        return;
    }
    genres.value = state.genres;
    filter.value = state.filter;
    nextTick(() => {
        scrollY.value = state.scrollY;
    });
});
</script>
