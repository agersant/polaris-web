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
            <AlbumGrid :albums="artist.albums_as_performer" :num-columns="numColumns" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { useAsyncState, watchImmediate } from "@vueuse/core";

import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import MultiSwitch from '@/components/basic/MultiSwitch.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import AlbumGrid from '@/components/library/AlbumGrid.vue';
import { getArtist, } from "@/api/endpoints";

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
// TODO timeline view
// TODO play/queue buttons
// TODO genre links
const { state: artist, isLoading, isReady, error, execute: fetchArtist } = useAsyncState((name: string) => getArtist(name), undefined, { immediate: false });
watchImmediate(() => props.name, () => {
    fetchArtist(0, props.name);
});

</script>