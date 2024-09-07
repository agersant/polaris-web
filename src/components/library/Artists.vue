<template>
    <div class="flex flex-col whitespace-nowrap select-none">
        <SectionTitle label="Artists" />

        <div v-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <!-- TODO error state -->

        <div v-else-if="isReady && !artists.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="person_off" suggestion="collectionSettings">
                No artists found.
            </BlankStateFiller>
        </div>

        <div v-else class="grow min-h-0 flex flex-col">

            <div class="mb-8 flex items-center justify-between">
                <div class="shrink basis-[500px] flex gap-4">
                    <Select class="grow basis-0" v-model="roleFilter" :options="roleFilters" />
                    <InputText class="grow basis-0" v-model="filter" id="filter" name="filter" placeholder="Filter"
                        icon="filter_alt" autofocus />
                </div>
                <MultiSwitch v-model="displayMode"
                    :items="[{ icon: 'view_list', value: 'fixed' }, { icon: 'text_fields', value: 'proportional' }]" />
            </div>

            <div class="grow min-h-0 -mr-4 pr-4" v-bind="containerProps" tabindex="-1">

                <div v-if="!filtered.length" class="grow flex mt-40 justify-center text-center">
                    <BlankStateFiller icon="person_off">
                        No artists match this filter.
                    </BlankStateFiller>
                </div>

                <ul class="flex flex-col divide-y divide-ls-200" v-bind="wrapperProps">
                    <li v-for="item of virtualArtists" :key="item.data.name"
                        class="flex items-center first:pt-1 py-4 gap-4" :style="`height: ${itemHeight}px`">
                        <span
                            class="material-icons-round rounded-full flex items-center justify-center text-ls-500 bg-ls-200 p-2">person</span>
                        <div class="flex flex-col w-96">
                            <span @click="router.push(makeArtistURL(item.data.name))"
                                class="cursor-pointer font-semibold text-ls-700 overflow-hidden text-ellipsis hover:text-accent-600 hover:underline"
                                :class="displayMode == 'fixed' ? 'text-sm' : ''"
                                :style="proportionalStyle[item.data.name]">
                                {{ item.data.name }}
                            </span>
                            <span v-if="displayMode == 'fixed'" class="mt-1 text-ls-500 text-xs">
                                {{ formatReleaseCount(item.data) }}
                            </span>
                        </div>
                        <div class="grow flex justify-end gap-2">
                            <Badge v-for="genre of getMainGenres(item.data)" :label="genre" :auto-color="true" />
                        </div>
                    </li>
                </ul>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, Ref, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAsyncState, useVirtualList } from "@vueuse/core";

import { getArtists } from "@/api/endpoints";
import Badge from "@/components/basic/Badge.vue";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import InputText from "@/components/basic/InputText.vue";
import MultiSwitch from "@/components/basic/MultiSwitch.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Select, { SelectOption } from "@/components/basic/Select.vue";
import Spinner from "@/components/basic/Spinner.vue";
import { ArtistHeader } from "@/api/dto";
import { makeArtistURL } from "@/router";

const router = useRouter();

const { state: artists, isLoading, isReady, error } = useAsyncState(getArtists(), []);

const filter = ref("");

// TODO save in preferences
const displayMode = ref("fixed");

type ArtistRole = "performer" | "composer" | "lyricist";
const roleFilters: SelectOption<ArtistRole>[] = [
    { label: "Performers", value: "performer" },
    { label: "Composers", value: "composer" },
    { label: "Lyricists", value: "lyricist" },
];
const roleFilter = ref(roleFilters[0]);

const filtered = computed(() => {
    const query = filter.value.toLowerCase();
    const role = roleFilter.value.value;
    return artists.value.filter(a => {
        switch (role) {
            case "performer":
                if (a.num_albums_as_performer <= 0 && a.num_albums_as_additional_performer < 2) {
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

    for (const artist of sorted) {
        const t = remap(artist.num_songs, pLow, pHigh, 0, 1);
        const size = remap(artist.num_songs, pLow, pHigh, 0.75, 1.75);
        style[artist.name] = {
            "color": `color-mix(in oklch, rgb(var(--surface-400)), rgb(var(--surface-800)) ${100 * t}%)`,
            "font-size": `${size}em`
        };
    }

    return style;
});

function getMainGenres(artist: ArtistHeader) {
    let genres = Object.entries(artist.num_songs_by_genre).map(([genre, count]) => ({ genre, count }));
    genres.sort((a, b) => a.count - b.count);
    let displayGenres = genres.slice(0, 3).map(({ genre }) => genre);
    displayGenres.sort();
    return displayGenres;
}

function formatReleaseCount(artist: ArtistHeader) {
    const plural = (n: number) => n > 1 ? "s" : "";
    const role = roleFilter.value.value;
    switch (role) {
        case "performer":
            {
                const albums = artist.num_albums_as_performer;
                const appearances = artist.num_albums_as_additional_performer;
                if (albums && appearances) {
                    return `${albums} release${plural(albums)}, ${appearances} other appearance${plural(appearances)}`;
                } else if (appearances) {
                    return `${appearances} appearance${plural(appearances)}`;
                } else {
                    return `${albums} release${plural(albums)}`;
                }
            }
        case "composer":
            {
                const albums = artist.num_albums_as_composer;
                return `${albums} release${plural(albums)}`;
            }
        case "lyricist":
            {
                const albums = artist.num_albums_as_lyricist;
                return `${albums} release${plural(albums)}`;
            }
    }

}
</script>
