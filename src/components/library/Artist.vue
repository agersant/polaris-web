<template>
    <div class="flex flex-col">
        <SectionTitle :label="name" class="mb-8">
            <template #right>
                <div class="flex justify-end gap-4">
                    <Button label="Play All" icon="play_arrow" severity="secondary" />
                    <Button label="Queue All" icon="playlist_add" severity="secondary" />
                </div>
            </template>
        </SectionTitle>

        <div class="mb-8 flex items-center justify-between gap-16">
            <div class="flex flex-wrap gap-2">
                <Badge v-for="genre of genres" :label="genre" :auto-color="true" />
            </div>
            <MultiSwitch v-model="displayMode" :items="[
                { icon: 'apps', value: 'grid5' },
                { icon: 'grid_view', value: 'grid3' },
                { icon: 'timeline', value: 'feed' }
            ]" />
        </div>

        <div v-if="artist" class="grow min-h-0 -m-4 p-4 overflow-y-scroll flex flex-col">

            <div class="flex flex-wrap content-start gap-y-8" :style="`column-gap: ${gapSize}px`">
                <div v-for="album of artist.albums_as_performer" class="flex flex-col gap-2" :style="itemStyle">
                    <div class="cursor-pointer aspect-square w-full transition-all ease-out duration-100 origin-center "
                        @click="router.push(makeAlbumURL(album.artists, album.name))"
                        :class="displayMode == 'grid3' ? 'hover:opacity-90 hover:scale-105' : 'hover:scale-110'">
                        <AlbumArt :url="album.artwork ? makeThumbnailURL(album.artwork, 'small') : undefined" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="font-medium text-sm line-clamp-2 text-ls-900 ">
                            {{ album.name }}
                        </div>
                        <div class="font-medium text-sm text-ls-500">{{ album.year }}</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";

import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import MultiSwitch from '@/components/basic/MultiSwitch.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import AlbumArt from '@/components/AlbumArt.vue';
import { getArtist, makeThumbnailURL } from "@/api/endpoints";
import { makeAlbumURL } from "@/router";

const router = useRouter();

const props = defineProps<{
    name: string,
}>();

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

const gapSize = ref(32);
const itemStyle = computed(() => {
    return {
        width: `calc(${100 / numColumns.value}% - ${gapSize.value * (numColumns.value - 1) / numColumns.value}px)`,
    }
});

const genres = computed(() => {
    let entries = Object.entries(artist.value?.num_songs_by_genre || {});
    let displayGenres = entries.map(([genre, count]) => ({ genre, count }));
    displayGenres.sort((a, b) => a.count - b.count).reverse();
    return displayGenres.map(({ genre }) => genre);
});

// TODO error state, load state
// TODO scroll state in history
// TODO composer/lyricist/additional performer grids
// TODO dark mode
// TODO handle artist URL change
// TODO timeline view
// TODO play/queue buttons
// TODO genre links
const { state: artist, isLoading, isReady, error } = useAsyncState(getArtist(props.name), undefined);


</script>