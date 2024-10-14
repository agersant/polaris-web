<template>
    <div v-bind="containerProps" tabindex="-1">
        <ul class="flex flex-col overflow-x-hidden
                divide-y divide-ls-200 dark:divide-ds-700" v-bind="wrapperProps">
            <!-- TODO context menus? -->
            <li v-for="item of virtualArtists" :key="item.data.name" class="flex items-center first:pt-1 py-4 gap-4"
                :style="`height: ${itemHeight}px`">
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
                                hover:text-accent-600 hover:underline" :class="listMode == 'fixed' ? 'text-sm' : ''"
                        :style="proportionalStyle[item.data.name]">
                        {{ item.data.name }}
                    </span>
                    <span v-if="listMode == 'fixed'" class="mt-1 text-xs text-ls-500 dark:text-ds-500">
                        {{ `${item.data.num_songs} ${pluralize('song', item.data.num_songs)}` }}
                    </span>
                </div>
                <div class="basis-1/4 grow shrink-[10] overflow-hidden flex max-h-14 flex-wrap justify-end gap-2">
                    <Badge v-for="genre of getMainGenres(item.data)" :label="genre" auto-color
                        @click="onGenreClicked(genre)" />
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, Ref } from 'vue';
import { useVirtualList } from '@vueuse/core';
import { useRouter } from 'vue-router';

import { ArtistHeader } from '@/api/dto';
import Badge from "@/components/basic/Badge.vue";
import { pluralize } from '@/format';
import { makeArtistURL, makeGenreURL } from "@/router";
import { ArtistListMode, usePreferencesStore } from '@/stores/preferences';

const router = useRouter();
const preferences = usePreferencesStore();

const props = defineProps<{
    artists: ArtistHeader[],
    listMode: ArtistListMode,
}>();

const itemHeight = 73;
const allArtists = computed(() => props.artists);
const { list: virtualArtists, containerProps, wrapperProps } = useVirtualList(allArtists, { itemHeight });

function remap(value: number, fromA: number, fromB: number, toA: number, toB: number) {
    return toA + (toB - toA) * Math.max(0, Math.min((value - fromA) / (fromB - fromA), 1));
}

const proportionalStyle: Ref<{ [key: string]: CSSProperties }> = computed(() => {
    if (props.listMode != "proportional" || !props.artists.length) {
        return {};
    }

    let style: { [key: string]: CSSProperties } = {};

    let sorted = [...props.artists];
    sorted.sort((a, b) => a.num_songs - b.num_songs);

    let pHigh = sorted[Math.floor(sorted.length * 0.9)].num_songs;
    let pLow = sorted[Math.floor(sorted.length * 0)].num_songs;

    const lowColor = preferences.polarity == "light" ? "--surface-400" : "--surface-400";
    const highColor = preferences.polarity == "light" ? "--surface-800" : "--surface-50";

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

function onGenreClicked(name: string) {
    router.push(makeGenreURL(name));
}
</script>