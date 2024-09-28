<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" />
        <div class="flex flex-wrap gap-2">
            <Badge v-for="genre of genres" :label="genre.name" :auto-color="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';

import { getGenres } from '@/api/endpoints';
import Badge from '@/components/basic/Badge.vue';
import PageTitle from '@/components/basic/PageTitle.vue';

defineProps<{
    genre?: string,
}>();

const { state: genres, isLoading, error } = useAsyncState(
    () => getGenres(),
    undefined,
);

</script>
