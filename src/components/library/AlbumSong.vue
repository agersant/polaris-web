<template>
    <div class="relative group flex gap-4">
        <div class="
        absolute -left-1 right-0 bottom-3.5 -top-1 rounded-sm
        group-hover:bg-ls-100 group-hover:dark:bg-ds-900
        outline-dotted outline-accent-500 dark:outline-accent-700
        " :class="[
            focused ? 'outline-1' : 'outline-0',
        ]" />
        <div class="z-10 w-6 text-right" v-text="`${song.track_number}.`"
            :class="selected ? 'text-accent-500 dark:text-accent-700' : 'text-ls-500 dark:text-ds-400'" />
        <div class="z-10 grow mb-2 pb-2 border-ls-200 dark:border-ds-700" :class="isLast ? 'border-0' : 'border-b'">
            <span v-text="formatTitle(song)"
                :class="selected ? 'text-accent-700 dark:text-accent-600' : 'text-ls-700 dark:text-ds-300'" />
            <span v-if="artists?.length"
                :class="selected ? 'text-accent-400 dark:text-accent-800' : 'text-ls-400 dark:text-ds-500'">
                <span v-text="` (`" />
                <span v-for="(artist, index) of artists">
                    <span v-text="artist" @click="onArtistClicked($event, artist)"
                        class="cursor-pointer hover:underline" />
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
    song: Song,
    selected: boolean,
    focused: boolean,
    isLast: boolean,
}>();

defineExpose({ song });

const artists = computed(() => {
    if (!song.album_artists?.length || !song.artists?.length) {
        return [];
    }
    return song.artists.filter(a => !song.album_artists?.includes(a));
});

function onArtistClicked(event: MouseEvent, name: string) {
    if (event.ctrlKey || event.shiftKey) {
        return;
    }
    if (!isFakeArtist(name)) {
        router.push(makeArtistURL(name));
    }
}

</script>
