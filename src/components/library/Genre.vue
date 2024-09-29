<template>
    <div class="flex flex-col">
        <PageTitle :label="genre">
            <template #left>
                <SwitchText class="ml-6 pl-6 border-l border-ls-200 dark:border-ds-700" v-model="viewMode" :items="[
                    { label: 'Overview', value: 'overview' },
                    { label: 'Artists', value: 'artists' },
                    { label: 'Albums', value: 'albums' }
                ]" />
            </template>
        </PageTitle>
        <div class="grow">

        </div>
    </div>
</template>


<script setup lang="ts">
import PageTitle from '@/components/basic/PageTitle.vue';
import SwitchText from '@/components/basic/SwitchText.vue';

// TODO overview main artists (by song count)
// TODO overview related genres (by correlation)
// TODO overview recently added albums
// TODO all artists
// TODO all albums
// TODO persistence
// TODO dark mode

const props = defineProps<{ genre: string }>();

const viewMode = "overview";

</script>
