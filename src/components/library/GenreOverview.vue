<template>
    <div ref="viewport" class="min-h-0 flex flex-col overflow-y-auto -mx-4 px-4">
        <div v-if="genre" class="flex flex-col gap-8">
            <div v-if="relatedGenres?.length">
                <Section>
                    <SectionTitle label="Related Genres" />
                    <div class="flex flex-wrap gap-2 max-h-8 overflow-hidden">
                        <Badge v-for="genre of relatedGenres" :label="genre" size="lg" auto-color
                            @click="onGenreClicked(genre)" />
                    </div>
                </Section>
            </div>
            <div v-if="mainArtists?.length">
                <Section>
                    <SectionTitle label="Main Artists" />
                    <div class="grid grid-cols-2 2xl:grid-cols-3 gap-4">
                        <div v-for="artist of mainArtists.slice(0, 6)" class="
                                cursor-pointer
                                flex items-center gap-4 px-3 p-4
                                rounded-md border border-ls-200 dark:border-ds-700
                                hover:bg-ls-100 hover:dark:bg-ds-700
                                " @click="onArtistClicked(artist.name)">
                            <span class="material-icons-round rounded-full p-2
                                    flex items-center justify-center
                                    text-ls-500 dark:text-ds-400
                                    bg-ls-200 dark:bg-ds-700">
                                person
                            </span>
                            <div class="flex flex-col gap-1 overflow-hidden">
                                <span v-text="artist.name"
                                    class="font-medium text-sm text-ls-900 dark:text-ds-200 overflow-hidden text-ellipsis" />
                                <span
                                    class="text-xs text-ls-500 dark:text-ds-500 whitespace-nowrap overflow-hidden text-ellipsis"
                                    v-text="`${artist.num_songs_by_genre[genre.name]} ${pluralize('song', artist.num_songs_by_genre[genre.name])}`" />
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
            <div v-if="genre.recently_added?.length">
                <Section>
                    <SectionTitle label="Recently Added" />
                    <AlbumGrid :albums="genre.recently_added" :max-rows="2" show-artists />
                </Section>
            </div>
        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner />
        </div>

        <Error v-else-if="error">
            Something went wrong while reading genre information.
        </Error>
    </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAsyncState } from '@vueuse/core';

import { getGenre } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import Error from '@/components/basic/Error.vue';
import Section from '@/components/basic/Section.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';
import { isFakeArtist, pluralize } from '@/format';
import { saveScrollState, useHistory } from '@/history';
import { makeArtistURL, makeGenreURL } from '@/router';

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

const mainArtists = computed(() => {
    const artists = genre.value?.main_artists;
    if (!artists) {
        return undefined;
    }
    return artists.filter(a => !isFakeArtist(a.name));
});

const viewport = useTemplateRef("viewport");

function onArtistClicked(name: string) {
    router.push(makeArtistURL(name));
}

function onGenreClicked(name: string) {
    router.push(makeGenreURL(name));
}

watch(() => props.name, () => fetchGenre(0, props.name));
if (!useHistory("genre-overview", [genre, saveScrollState(viewport)])) {
    fetchGenre(0, props.name);
}

</script>
