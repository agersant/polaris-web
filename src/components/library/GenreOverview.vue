<template>
    <div ref="viewport" class="min-h-0">
        <div v-if="genre" class=" flex flex-col gap-8 overflow-scroll">
            <div v-if="relatedGenres?.length">
                <SectionTitle label="Related Genres" icon="label" />
                <div class="flex flex-wrap gap-2">
                    <Badge v-for="genre of relatedGenres" :label="genre" size="lg" auto-color
                        @click="onGenreClicked(genre)" />
                </div>
            </div>
            <SectionTitle label="Main Artists" icon="person" />
            <SectionTitle label="Recently Added" icon="new_releases" />
        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while reading genre information.
        </Error>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, toRaw, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState, useScroll, watchImmediate, watchThrottled } from '@vueuse/core';

import { Genre } from '@/api/dto';
import { getGenre } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import Error from '@/components/basic/Error.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import { makeGenreURL } from '@/router';

// TODO overview main artists (by song count)
// TODO overview related genres (by correlation)
// TODO overview recently added albums
// TODO persistence
// TODO dark mode

const router = useRouter();

const props = defineProps<{ name: string }>();

const { state: genre, isLoading, error, execute: fetchGenre } = useAsyncState(getGenre, undefined, { immediate: false, resetOnExecute: true });

const relatedGenres = computed(() => {
    const related = genre.value?.related_genres;
    if (!related) {
        return undefined;
    }
    let sorted = Object.keys(related);
    if (!sorted.length) {
        return undefined;
    }
    sorted.sort((a, b) => related[b] - related[a]);
    return sorted.slice(0, 20);
});

const viewport = useTemplateRef("viewport");
const { y: scrollY } = useScroll(viewport);

function onGenreClicked(name: string) {
    router.push(makeGenreURL(name));
}

const historyStateKey = "genre-overview";

interface State {
    genre?: Genre,
    scrollY: number,
}

watchThrottled([genre, scrollY], async () => {
    const state: State = {
        genre: toRaw(genre.value),
        scrollY: scrollY.value,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

watchImmediate(() => props.name, () => {
    const state = history.state[historyStateKey] as State | undefined;
    if (!state?.genre) {
        fetchGenre(0, props.name);
        return;
    }
    genre.value = state.genre;
    nextTick(() => {
        scrollY.value = state.scrollY;
    });
});

</script>
