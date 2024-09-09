<template>
    <div class="flex items-center gap-2">
        <div class="w-10 h-10">
            <AlbumArt :url="album.artwork ? makeThumbnailURL(album.artwork, 'tiny') : undefined" />
        </div>
        <div class="max-w-80 font-medium text-sm" v-text="album.name" />
    </div>
</template>

<script setup lang="ts">
import { AlbumHeader } from '@/api/dto';
import { makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';

defineProps<{ album: AlbumHeader }>();
</script>
