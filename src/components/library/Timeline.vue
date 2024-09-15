<template>
    <div>
        <div v-for="(event, index) in events">
            <div class="flex gap-x-4 items-center">

                <div @click="onAlbumClicked(event.album)"
                    :class="event.isMainRelease ? 'h-24 w-24 rounded-lg' : 'h-12 w-12 mx-6 rounded-full'" class="
                    shrink-0 overflow-hidden shadow-md
                    cursor-pointer origin-center
                    transition-all ease-out duration-100
                    hover:opacity-90 hover:scale-125
                ">
                    <Draggable :make-payload="() => new DndPayloadAlbumHeader(event.album)">
                        <AlbumArt :url="event.artworkURL" />
                        <template #drag-preview>
                            <AlbumDragPreview :album="event.album" />
                        </template>
                    </Draggable>
                </div>

                <div class="flex min-w-0 flex-1 justify-between space-x-4">
                    <div class="mr-8 flex flex-col text-sm text-ls-500 dark:text-ds-400">

                        <p class="whitespace-pre-line leading-6">

                            <span>{{ event.action }}&nbsp;</span>

                            <span v-if="event.albumOwners?.length">
                                <span v-for="(artist, index) of event.albumOwners" class="inline-flex">
                                    <span v-text="artist"
                                        class="cursor-pointer underline text-accent-600 dark:text-accent-700"
                                        @click="onArtistClicked(artist)" />
                                    <span v-if="index == event.albumOwners.length - 2">&nbsp;&&nbsp;</span>
                                    <span v-else-if="index < event.albumOwners.length - 1">,&nbsp;</span>
                                </span>
                                <span>'s&nbsp;</span>
                            </span>

                            <span @click="onAlbumClicked(event.album)"
                                class="cursor-pointer font-medium text-ls-900 dark:text-ds-200 hover:underline">
                                {{ event.album.name }}
                            </span>

                            <span v-if="event.albumCollaborators?.length">
                                <span>&nbsp;with&nbsp;</span>
                                <span v-for="(artist, index) of event.albumCollaborators" class="inline-flex">
                                    <span v-text="artist"
                                        class="cursor-pointer underline text-accent-600 dark:text-accent-700"
                                        @click="onArtistClicked(artist)" />
                                    <span v-if="index == event.albumCollaborators.length - 2">&nbsp;&&nbsp;</span>
                                    <span v-else-if="index < event.albumCollaborators.length - 1">,&nbsp;</span>
                                </span>
                            </span>
                        </p>

                    </div>

                    <div class="whitespace-nowrap text-right text-sm text-ls-500 dark:text-ds-400">
                        {{ event.year || "????" }}
                    </div>
                </div>
            </div>
            <div v-if="index != events.length - 1" class="h-6 mx-12 my-2 w-px bg-ls-300 dark:bg-ds-600" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { AlbumHeader, ArtistAlbum } from '@/api/dto';
import { makeThumbnailURL } from '@/api/endpoints';
import AlbumArt from '@/components/AlbumArt.vue';
import Draggable from '@/components/basic/Draggable.vue';
import AlbumDragPreview from '@/components/library/AlbumDragPreview.vue';
import { DndPayloadAlbumHeader } from '@/dnd';
import { isFakeArtist, pluralize } from '@/format';
import { makeAlbumURL, makeArtistURL } from '@/router';

const router = useRouter();

const props = defineProps<{
    artist: string,
    albums: ArtistAlbum[],
}>();

interface Event {
    album: AlbumHeader,
    artworkURL: string | undefined,
    isMainRelease: boolean,
    year: number,
    action: string,
    albumOwners: string[] | undefined,
    albumCollaborators: string[] | undefined,
}

const events = computed(() => {
    let events: Event[] = [];
    for (const album of props.albums) {
        const numPerformerCredits = album.contributions.filter(c => c.performer).length;
        const numComposerCredits = album.contributions.filter(c => c.composer).length;
        const numLyricistCredits = album.contributions.filter(c => c.lyricist).length;
        const numContributions = album.contributions.filter(c => c.performer || c.composer || c.lyricist).length;
        const multiRole = [numPerformerCredits, numComposerCredits, numLyricistCredits].filter(n => n > 0).length > 1;
        const isMainArtist = album.main_artists.includes(props.artist);
        const albumOwners = isMainArtist ? undefined : album.main_artists.filter(a => a != props.artist && !isFakeArtist(a));
        const albumCollaborators = isMainArtist ? album.main_artists.filter(a => a != props.artist) : undefined;
        const isMainRelease = isMainArtist || numContributions >= album.contributions.length / 2;

        let action = "";

        if (isMainArtist || (isMainRelease && !albumOwners?.length)) {
            action = "Released";
        } else if (multiRole || numPerformerCredits > 0) {
            action = `Was involved with ${numContributions} ${pluralize("song", numContributions)} on`;
        } else if (numComposerCredits == album.contributions.length) {
            action = `Composed`;
        } else if (numComposerCredits > 0) {
            action = `Composed ${numComposerCredits} ${pluralize("song", numComposerCredits)} on`;
        } else if (numLyricistCredits == album.contributions.length) {
            action = `Wrote lyrics on`;
        } else if (numLyricistCredits > 0) {
            action = `Wrote lyrics for ${numLyricistCredits} ${pluralize("song", numLyricistCredits)} on`;
        }

        events.push({
            album,
            artworkURL: album.artwork ? makeThumbnailURL(album.artwork, "small") : undefined,
            year: album.year || 0,
            isMainRelease,
            action,
            albumOwners,
            albumCollaborators,
        });
    }

    events.reverse();
    return events;
});

function onArtistClicked(name: string) {
    router.push(makeArtistURL(name));
}

function onAlbumClicked(album: AlbumHeader) {
    router.push(makeAlbumURL(album.main_artists, album.name)).catch(err => { });
}
</script>
