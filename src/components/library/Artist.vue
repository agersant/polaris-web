<template>
    <div class="flex flex-col">
        <SectionTitle :label="name" class="mb-8">
            <template #right>
                <div class="basis-0 grow max-h-6 ml-6 mt-1.5 overflow-hidden flex flex-wrap justify-end gap-2">
                    <Badge v-for="genre of genres" :label="genre" :auto-color="true" />
                </div>
            </template>
        </SectionTitle>

        <div v-if="artist" class="flex flex-col min-h-0">
            <div class="mb-8 flex items-center justify-between gap-16">
                <div class="flex gap-4">
                    <Button label="Play All" icon="play_arrow" severity="secondary" />
                    <Button label="Queue All" icon="playlist_add" severity="secondary" />
                </div>
                <Switch v-model="displayMode" :items="[
                    { icon: 'apps', value: 'grid5' },
                    { icon: 'grid_view', value: 'grid3' },
                    { icon: 'timeline', value: 'feed' }
                ]" />
            </div>

            <div ref="viewport" class="grow -m-4 p-4 overflow-y-scroll flex flex-col">
                <div v-if="mainWorks?.length" class="mb-16">
                    <div class="mb-8 flex items-center">
                        <span class="material-icons-round text-ls-400">library_music</span>
                        <div class="px-2 font-medium text-ls-500">Main Releases</div>
                    </div>
                    <AlbumGrid :albums="mainWorks" :num-columns="numColumns" />
                </div>
                <div v-if="additionalWorks?.length">
                    <div class="mb-8 flex items-center">
                        <span class="material-icons-round text-ls-400">group_add</span>
                        <div class="px-2 font-medium text-ls-500">Featured On</div>
                    </div>
                    <AlbumGrid :albums="additionalWorks" :num-columns="numColumns" />
                </div>
            </div>

            <!-- TODO orphaned song support -->

        </div>

        <div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <Error v-else-if="error">
            Something went wrong while listing releases.
        </Error>

    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, toRaw, useTemplateRef, watch } from "vue";
import { useAsyncState, useScroll, watchImmediate, watchThrottled } from "@vueuse/core";

import { Artist } from "@/api/dto";
import { getArtist, } from "@/api/endpoints";
import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import Error from '@/components/basic/Error.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Switch from '@/components/basic/Switch.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';

const props = defineProps<{
    name: string,
}>();

const { state: fetchedArtist, isLoading, error, execute: fetchArtist } = useAsyncState(
    (name: string) => getArtist(name),
    undefined,
    { immediate: false, resetOnExecute: true }
);

watchImmediate(() => props.name, () => {
    fetchArtist(0, props.name);
});

const artist: Ref<Artist | undefined> = ref(undefined);
watch(fetchedArtist, a => {
    if (!artist.value || !a) {
        artist.value = a;
    }
});

type DisplayMode = "grid5" | "grid3" | "timeline";

// TODO save in preferences
const displayMode: Ref<DisplayMode> = ref("grid5");

const numColumns = computed(() => {
    switch (displayMode.value) {
        case "grid5": return 5;
        case "grid3": return 3;
        case "timeline": return 1;
    };
});

const genres = computed(() => {
    let entries = Object.entries(artist.value?.num_songs_by_genre || {});
    let displayGenres = entries.map(([genre, count]) => ({ genre, count }));
    displayGenres.sort((a, b) => a.count - b.count).reverse();
    return displayGenres.map(({ genre }) => genre);
});

const mainWorks = computed(() => {
    if (!artist.value) {
        return undefined;
    }

    let works = [];
    for (const album of artist.value.albums) {
        if (album.main_artists.includes(artist.value.name)) {
            works.push(album);
        } else {
            const numContributions = album.contributions.filter(c => c.composer || c.lyricist || c.performer).length;
            if (numContributions >= album.contributions.length / 2) {
                works.push(album);
            }
        }
    }

    return works;
});

const additionalWorks = computed(() => {
    const albums = artist.value?.albums;
    const main = mainWorks.value;
    if (!albums || !main) {
        return undefined;
    }
    return albums.filter(a => !main.includes(a));
});

// TODO dark mode
// TODO timeline view
// TODO play/queue buttons
// TODO genre links

const viewport = useTemplateRef("viewport");
const { y: scrollY } = useScroll(viewport);

const historyStateKey = "artist";

watchThrottled([artist, scrollY], async () => {
    const state = {
        artist: toRaw(artist.value),
        scrollY: scrollY.value || 0,
    };
    history.replaceState({ ...history.state, [historyStateKey]: state }, "");
}, { throttle: 500 });

onMounted(async () => {
    const state = history.state[historyStateKey];
    if (!state) {
        return;
    }
    artist.value = state.artist;
    nextTick(() => {
        viewport.value?.scrollTo({ top: state.scrollY });
    });
});
</script>
