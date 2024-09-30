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
                <InputText class="w-80" v-model="filter" id="filter" name="filter" placeholder="Filter"
                    icon="filter_alt" autofocus clearable />
                <!-- TODO tooltips -->
                <Switch v-model="displayMode"
                    :items="[{ icon: 'view_list', value: 'fixed' }, { icon: 'text_fields', value: 'proportional' }]" />
            </div>
            <ArtistList ref="list" class="grow min-h-0 -mr-4 pr-4" :artists="filtered" :display-mode="displayMode" />
        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
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
import { computed, nextTick, onMounted, Ref, ref, useTemplateRef, watch } from "vue";
import { useAsyncState, useScroll, watchThrottled } from "@vueuse/core";

import { compress, decompress } from "@/disk";
import { getArtists } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Switch from "@/components/basic/Switch.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import ArtistList, { DisplayMode } from "@/components/library/ArtistList.vue";
import { ArtistHeader } from "@/api/dto";

const artists: Ref<ArtistHeader[]> = ref([]);

const { state: fetchedArtists, isLoading, isReady, error } = useAsyncState(getArtists, []);
watch(fetchedArtists, (a) => {
    if (!artists.value.length) {
        artists.value = a;
    }
});

const filter = ref("");

// TODO save in preferences
const displayMode: Ref<DisplayMode> = ref("fixed");

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

const historyStateKey = "artists";

watchThrottled([artists, filter, roleFilter, scrollY], async () => {
    const state = {
        artists: await compress(JSON.stringify((artists.value.filter(isRelevant)))),
        filter: filter.value,
        roleFilter: roleFilter.value,
        scrollY: scrollY.value || 0,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

onMounted(async () => {
    const state = history.state[historyStateKey];
    if (!state) {
        return;
    }
    filter.value = state.filter;
    roleFilter.value = state.roleFilter;
    artists.value = JSON.parse(await decompress(state.artists));
    nextTick(() => {
        scrollY.value = state.scrollY;
    });
});

</script>
