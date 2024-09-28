<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" />

        <div v-show="treeModel.length" class="grow min-h-0 flex flex-col">
            <VirtualTree ref="tree" v-model="treeModel" class="grow" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, Ref, shallowRef, watch } from 'vue';
import { useAsyncState } from '@vueuse/core';

import { GenreHeader } from '@/api/dto';
import { getGenres } from '@/api/endpoints';
import PageTitle from '@/components/basic/PageTitle.vue';
import VirtualTree from '@/components/basic/VirtualTree.vue';
import { Node } from "@/components/basic/VirtualTree.vue";

defineProps<{
    genre?: string,
}>();

const { state: genres, isLoading, error } = useAsyncState(
    () => getGenres().then(g => makeGenreNodes(g)),
    undefined,
);

const treeModel: Ref<Node[]> = shallowRef([]);

watch(genres, (v) => {
    if (v && !treeModel.value.length) {
        treeModel.value = v;
    }
});

function makeGenreNodes(genres: GenreHeader[]): Node[] {
    return genres.map((g, index) => {
        return {
            depth: 0,
            key: g.name,
            label: g.name,
            icon: "label",
            leaf: false,
        };
    });
}

const filterQuery = ref("");

</script>
