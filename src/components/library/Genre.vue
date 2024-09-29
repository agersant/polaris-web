<template>
    <PageTitle :label="genre" />
</template>


<script setup lang="ts">
import PageTitle from '@/components/basic/PageTitle.vue';

// TODO main artists (by song count)
// TODO related genres (by correlation)
// TODO recently added albums
// TODO all artists
// TODO all albums
// TODO persistence
// TODO dark mode

const props = defineProps<{ genre: string }>();

</script>
