<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" />

        <InputText class="mb-8" v-model="filter" id="filter" name="filter" placeholder="Filter" icon="filter_alt"
            autofocus clearable />

        <div v-if="genres && filtered.length" class="min-h-0 flex flex-wrap gap-2 -mx-4 px-4 overflow-scroll">
            <Badge v-for="genre of filtered" :label="genre.name" size="lg" auto-color @click="onGenreClicked(genre)" />
        </div>

        <div v-else-if="genres && !genres.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="label_off">
                No genres found.
            </BlankStateFiller>
        </div>

        <div v-else-if="genres && !filtered.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="label_off">
                No genres match this filter.
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
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState } from '@vueuse/core';

import { getGenres } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import { GenreHeader } from '@/api/dto';
import { makeGenreURL } from '@/router';

// TODO Play all / queue all (entire collection, sorted by genre?)
// TODO drag and drop to playlist
// TODO dark mode
// TODO persistence

const router = useRouter();

const { state: genres, isLoading, error } = useAsyncState(
    () => getGenres(),
    undefined,
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
</script>
