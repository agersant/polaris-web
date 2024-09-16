<template>
    <div class="group flex gap-4">
        <div class="w-6 text-right text-ls-500 dark:text-ds-400" v-text="`${song.track_number}.`" />
        <div class="grow mb-2 pb-2 border-b border-ls-200 dark:border-ds-700 group-last:border-0">
            <span class="text-ls-700 dark:text-ds-300" v-text="formatTitle(song)" />
            <span v-if="artists?.length" class="text-ls-400 dark:text-ds-500">
                <span v-text="` (`" />
                <span v-for="(artist, index) of artists">
                    <span v-text="artist" @click="onArtistClicked(artist)" class="cursor-pointer hover:underline" />
                    <span v-if="index < artists.length - 1" v-text="`, `" />
                </span>
                <span v-text="`)`" />
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Song } from '@/api/dto';
import { formatTitle, isFakeArtist } from '@/format';
import { makeArtistURL } from '@/router';

const router = useRouter();

const { song } = defineProps<{
    song: Song
}>();

const artists = computed(() => {
    if (!song.album_artists?.length || !song.artists?.length) {
        return [];
    }
    return song.artists.filter(a => !song.album_artists?.includes(a));
});

function onArtistClicked(name: string) {
    if (!isFakeArtist(name)) {
        router.push(makeArtistURL(name));
    }
}

</script>
