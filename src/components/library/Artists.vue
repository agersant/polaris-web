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

            <div class="grow min-h-0 -mr-4 pr-4" v-bind="containerProps" tabindex="-1">

                <div v-if="!filtered.length" class="grow flex mt-40 justify-center text-center">
                    <BlankStateFiller icon="person_off">
                        No artists match this filter.
                    </BlankStateFiller>
                </div>

                <ul class="flex flex-col overflow-x-hidden
                divide-y divide-ls-200 dark:divide-ds-700" v-bind="wrapperProps">
                    <!-- TODO context menus? -->
                    <li v-for="item of virtualArtists" :key="item.data.name"
                        class="flex items-center first:pt-1 py-4 gap-4" :style="`height: ${itemHeight}px`">
                        <span class="material-icons-round rounded-full p-2
                            flex items-center justify-center
                            text-ls-500 dark:text-ds-400
                            bg-ls-200 dark:bg-ds-700">
                            person
                        </span>
                        <div class="basis-fit shrink min-w-0 pr-8 flex flex-col">
                            <span @click="router.push(makeArtistURL(item.data.name))" class="cursor-pointer font-semibold
                                overflow-hidden text-ellipsis
                                text-ls-700 dark:text-ds-300
                                hover:text-accent-600 hover:underline" :class="displayMode == 'fixed' ? 'text-sm' : ''"
                                :style="proportionalStyle[item.data.name]">
                                {{ item.data.name }}
                            </span>
                            <span v-if="displayMode == 'fixed'" class="mt-1 text-xs text-ls-500 dark:text-ds-500">
                                {{ `${item.data.num_songs} ${pluralize('song', item.data.num_songs)}` }}
                            </span>
                        </div>
                        <div
                            class="basis-1/4 grow shrink-[10] overflow-hidden flex max-h-14 flex-wrap justify-end gap-2">
                            <!-- TODO clickable genres -->
                            <Badge v-for="genre of getMainGenres(item.data)" :label="genre" :auto-color="true" />
                        </div>
                    </li>
                </ul>
            </div>

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
import { computed, CSSProperties, nextTick, onMounted, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAsyncState, useScroll, useVirtualList, watchThrottled } from "@vueuse/core";

import { compress, decompress } from "@/disk";
import { getArtists } from "@/api/endpoints";
import Badge from "@/components/basic/Badge.vue";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Switch from "@/components/basic/Switch.vue";
import SwitchText from "@/components/basic/SwitchText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import { ArtistHeader } from "@/api/dto";
import { pluralize } from "@/format";
import { makeArtistURL } from "@/router";
import { usePreferencesStore } from "@/stores/preferences";

const router = useRouter();
const preferences = usePreferencesStore();

const artists: Ref<ArtistHeader[]> = ref([]);

const { state: fetchedArtists, isLoading, isReady, error } = useAsyncState(getArtists(), []);
watch(fetchedArtists, (a) => {
    if (!artists.value.length) {
        artists.value = a;
    }
});

const filter = ref("");

// TODO save in preferences
const displayMode = ref("fixed");

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

const itemHeight = 73;
const { list: virtualArtists, containerProps, wrapperProps, scrollTo } = useVirtualList(filtered, { itemHeight });

const viewport = computed(() => containerProps.ref.value);
const { y: scrollY } = useScroll(viewport);

watch(filtered, () => scrollTo(0));

function remap(value: number, fromA: number, fromB: number, toA: number, toB: number) {
    return toA + (toB - toA) * Math.max(0, Math.min((value - fromA) / (fromB - fromA), 1));
}

const proportionalStyle: Ref<{ [key: string]: CSSProperties }> = computed(() => {
    if (displayMode.value != "proportional" || !filtered.value.length) {
        return {};
    }

    let style: { [key: string]: CSSProperties } = {};

    let sorted = [...filtered.value];
    sorted.sort((a, b) => a.num_songs - b.num_songs);

    let pHigh = sorted[Math.floor(sorted.length * 0.9)].num_songs;
    let pLow = sorted[Math.floor(sorted.length * 0)].num_songs;

    const lowColor = preferences.effectivePolarity == "light" ? "--surface-400" : "--surface-400";
    const highColor = preferences.effectivePolarity == "light" ? "--surface-800" : "--surface-50";

    for (const artist of sorted) {
        const t = remap(artist.num_songs, pLow, pHigh, 0, 1);
        const size = remap(artist.num_songs, pLow, pHigh, 0.75, 1.75);
        style[artist.name] = {
            "color": `color-mix(in oklch, rgb(var(${lowColor})), rgb(var(${highColor})) ${100 * t}%)`,
            "font-size": `${size}em`
        };
    }

    return style;
});

function getMainGenres(artist: ArtistHeader) {
    let genres = Object.entries(artist.num_songs_by_genre).map(([genre, count]) => ({ genre, count }));
    genres.sort((a, b) => {
        if (a.count != b.count) {
            return a.count - b.count
        } else {
            return a.genre < b.genre ? 1 : -1;
        }
    }).reverse();
    let displayGenres = genres.slice(0, 10).map(({ genre }) => genre);
    return displayGenres;
}

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
        viewport.value?.scrollTo({ top: state.scrollY });
    });
});
</script>
