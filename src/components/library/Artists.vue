<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Artists">
            <template #left>
                <SwitchText class="ml-6 pl-6 border-l border-ls-200 dark:border-ds-700" v-model="roleFilter" :items="[
                    { label: 'Performers', value: 'performer' },
                    { label: 'Composers', value: 'composer' },
                    { label: 'Lyricists', value: 'lyricist' }
                ]" />
            </template>
        </PageTitle>

        <div v-if="artists.length" class="grow min-h-0 flex flex-col">
            <div class="mb-8 flex items-center justify-between">
                <!-- TODO tooltips -->
                <InputText class="w-64 xl:w-80" v-model="filter" id="filter" placeholder="Filter" icon="filter_alt"
                    autofocus clearable />
                <!-- TODO tooltips -->
                <Switch v-model="preferences.artistListMode"
                    :items="[{ icon: 'view_list', value: 'fixed' }, { icon: 'text_fields', value: 'proportional' }]" />
            </div>
            <ArtistList v-if="filtered.length" ref="list" class="grow min-h-0 -mr-4 pr-4" :artists="filtered"
                :list-mode="preferences.artistListMode" />
            <div v-else class="grow flex mt-40 justify-center text-center">
                <BlankStateFiller icon="filter_alt_off">
                    No artists match this filter.
                </BlankStateFiller>
            </div>

        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing artists.
        </Error>

        <div v-else-if="isReady && !artists.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="person_off" suggestion="collectionSettings">
                No artists found.
            </BlankStateFiller>
        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, toRaw, useTemplateRef, watch } from "vue";
import { useAsyncState, useScroll } from "@vueuse/core";

import { ArtistHeader } from "@/api/dto";
import { getArtists } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Switch from "@/components/basic/Switch.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import ArtistList from "@/components/library/ArtistList.vue";
import { saveScrollState, useHistory } from "@/history";
import { usePreferencesStore } from "@/stores/preferences";

const preferences = usePreferencesStore();

const artists: Ref<ArtistHeader[]> = ref([]);

const { state: fetchedArtists, isLoading, isReady, error } = useAsyncState(getArtists, []);
watch(fetchedArtists, (a) => {
    if (!artists.value.length) {
        artists.value = a;
    }
});

const filter = ref("");

type ArtistRole = "performer" | "composer" | "lyricist";
const roleFilter: Ref<ArtistRole> = ref("performer");

function isRelevant(artist: ArtistHeader) {
    return artist.num_albums_as_performer > 0
        || artist.num_albums_as_composer > 0
        || artist.num_albums_as_lyricist > 0
        || artist.num_albums_as_additional_performer > 1;
}

const filtered = computed(() => {
    const query = filter.value.toLowerCase();
    return artists.value.filter(a => {
        if (!isRelevant(a)) {
            return false;
        }
        switch (roleFilter.value) {
            case "performer":
                if (a.num_albums_as_performer < 1 && a.num_albums_as_additional_performer < 2) {
                    return false;
                }
                break;
            case "composer":
                if (a.num_albums_as_composer < 1) {
                    return false;
                }
                break;
            case "lyricist":
                if (a.num_albums_as_lyricist < 1) {
                    return false;
                }
                break;
        }
        if (!filter.value.length) {
            return true;
        }
        return a.name.toLowerCase().includes(query);
    });
});

const list = useTemplateRef("list");
const viewport = computed(() => list.value?.$el);
const { y: scrollY } = useScroll(viewport);

watch(filtered, () => scrollY.value = 0);

const saveArtists = {
    save: () => toRaw(artists.value).filter(isRelevant),
    restore: (v: ArtistHeader[]) => artists.value = v,
};

useHistory("artists", [saveArtists, filter, roleFilter, saveScrollState(viewport)]);

</script>
