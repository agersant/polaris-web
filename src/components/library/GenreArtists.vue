<template>
    <div v-if="artists?.length" class="min-h-0 flex flex-col">
        <div class="min-h-0 flex flex-col">
            <div class="mb-8 flex items-center justify-between">
                <!-- TODO tooltips -->
                <InputText class="w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                    icon="filter_alt" autofocus clearable />
                <!-- TODO tooltips -->
                <Switch v-model="displayMode"
                    :items="[{ icon: 'view_list', value: 'fixed' }, { icon: 'text_fields', value: 'proportional' }]" />
            </div>
            <ArtistList ref="list" v-if="filteredArtists.length" :artists="filteredArtists" :display-mode="displayMode"
                class="-mx-4 px-4" />
            <div v-else class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="filter_alt_off">
                    No artists match this filter.
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
import { computed, Ref, ref, useTemplateRef, watch } from 'vue';
import { useAsyncState } from '@vueuse/core';

import { ArtistHeader } from '@/api/dto';
import { getGenreArtists } from '@/api/endpoints';
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
import Error from '@/components/basic/Error.vue';
import InputText from '@/components/basic/InputText.vue';
import Spinner from '@/components/basic/Spinner.vue';
import Switch from '@/components/basic/Switch.vue';
import ArtistList, { DisplayMode } from '@/components/library/ArtistList.vue';
import { saveScrollState, useHistory } from '@/history';

const props = defineProps<{ name: string }>();

const filter = ref("");

// TODO save in preferences
const displayMode: Ref<DisplayMode> = ref("fixed");

const { state: artists, isLoading, error, execute: fetchArtists } = useAsyncState(getGenreArtists, undefined, { immediate: false, resetOnExecute: true });

const artistList = useTemplateRef("list");
const viewport = computed(() => artistList.value?.$el);

function isRelevant(artist: ArtistHeader) {
    return artist.num_albums_as_performer > 0
        || artist.num_albums_as_composer > 0
        || artist.num_albums_as_lyricist > 0
        || artist.num_albums_as_additional_performer > 1;
}

const filteredArtists = computed(() => {
    if (!artists.value) {
        return [];
    }
    const query = filter.value.toLowerCase();
    return artists.value.filter(a => {
        if (!isRelevant(a)) {
            return false;
        }
        if (!query.length) {
            return true;
        }
        if (a.name.toLowerCase().includes(query)) {
            return true;
        }
        return false;
    });
});

if (!useHistory("genre-artists", [artists, filter, saveScrollState(viewport)])) {
    fetchArtists(0, props.name);
}

watch(() => props.name, () => {
    fetchArtists(0, props.name);
});

</script>
