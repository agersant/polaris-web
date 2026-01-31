<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" caption="Explore music by genre tags." />

        <div v-if="genres && genres.length" class="grow min-h-0 flex flex-col">
            <InputText class="mb-8" v-model="filter" id="filter" placeholder="Filter" icon="filter_alt" autofocus
                clearable />
            <div v-if="filtered.length" ref="viewport" class="flex flex-wrap gap-2 -mx-4 px-4 overflow-y-auto">
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
            <Spinner />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing genres.
        </Error>

    </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState } from '@vueuse/core';

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
import { saveScrollState, useHistory } from '@/history';
import { makeGenreURL } from '@/router';

const router = useRouter();

const viewport = useTemplateRef("viewport");

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

if (!useHistory("genres", [genres, filter, saveScrollState(viewport)])) {
    fetchGenres();
}

</script>
