<template>
    <div v-if="albums?.length" class="min-h-0 flex flex-col">
        <div class="min-h-0 flex flex-col">
            <InputText class="mb-8 w-80" v-model="filter" id="filter" placeholder="Filter" icon="filter_alt" autofocus
                clearable />
            <AlbumGrid v-if="filteredAlbums.length" ref="album-grid" class="-m-4 p-4 overflow-y-auto"
                :albums="filteredAlbums" :show-artists="true">
            </AlbumGrid>
            <div v-else class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="filter_alt_off">
                    No albums match this filter.
                </BlankStateFiller>
            </div>
        </div>
    </div>

    <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
        <Spinner />
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
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useAsyncState } from '@vueuse/core';

import { getGenreAlbums } from '@/api/endpoints';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';
import { saveScrollState, useHistory } from '@/history';

const props = defineProps<{ name: string }>();

const filter = ref("");

const { state: albums, isLoading, error, execute: fetchAlbums } = useAsyncState(getGenreAlbums, undefined, { immediate: false, resetOnExecute: true });

const grid = useTemplateRef("album-grid");
const viewport = computed(() => grid.value?.$el);

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

if (!useHistory("genre-albums", [albums, filter, saveScrollState(viewport)])) {
    fetchAlbums(0, props.name);
}

watch(() => props.name, () => {
    fetchAlbums(0, props.name);
});

</script>
