<template>
	<div class="flex flex-col">
		<PageTitle :label="header">
			<template #right>
				<div class="ml-8 flex gap-2">
					<Button label="Play All" severity="secondary" icon="play_arrow" @click="play" />
					<Button label="Queue All" severity="secondary" icon="playlist_add" @click="queue" />
				</div>
			</template>
		</PageTitle>

		<div v-if="fetchedAlbum" class="grow min-h-0 flex flex-col">

			<div class="basis-10 shrink-0 mb-8 flex items-center">
				<div class="text-sm uppercase font-medium text-ls-500 dark:text-ds-400">
					<span v-text="`By `" />
					<span v-for="(artist, index) of albumKey.artists" class="inline-flex">
						<span v-text="artist" :class="isFakeArtist(artist) ? '' :
							'cursor-pointer underline text-accent-600 dark:text-accent-700'" @click="onArtistClicked(artist)" />
						<span v-if="index == albumKey.artists.length - 2">&nbsp;&&nbsp;</span>
						<span v-else-if="index < albumKey.artists.length - 1">,&nbsp;</span>
					</span>
				</div>
				<div class="basis-0 grow max-h-14 ml-6 overflow-hidden flex flex-wrap justify-end gap-2">
					<!-- TODO genre links -->
					<Badge v-for="genre of genres" :label="genre" :auto-color="true" />
				</div>
			</div>

			<div class="min-h-0 flex items-start gap-8">
				<div class="basis-2/5 shrink-0">
					<Draggable :make-payload="() => new DndPayloadAlbum(fetchedAlbum as AlbumDTO)" class="cursor-grab">
						<AlbumArt :url="artworkURL" size="lg" class="shadow-lg shadow-ls-100 dark:shadow-ds-900" />
						<template #drag-preview>
							<AlbumDragPreview :album="fetchedAlbum" />
						</template>
					</Draggable>
					<div v-text="`${albumKey.name} (${fetchedAlbum.year})`"
						class="mt-3 px-4 italic text-ls-500 dark:text-ds-400 text-xs text-center" />
				</div>
				<div class="grow -mr-4 pr-4 self-stretch overflow-scroll flex flex-col gap-8">
					<div v-for="[discNumber, songs] of discs" class="flex flex-col">
						<SectionTitle v-if="discs?.size && discNumber" icon="numbers" :label="`Disc ${discNumber}`" />
						<AlbumSong v-for="song of songs" :song="song" />
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner class="text-ls-700 dark:text-ds-400" />
		</div>

		<Error v-else-if="error">
			Something went wrong while listing songs.
		</Error>
	</div>
</template>

<script setup lang="ts">
import { computed, } from "vue";
import { useAsyncState, watchImmediate } from "@vueuse/core";
import { useRouter } from "vue-router";

import { Album as AlbumDTO, AlbumKey, Song } from "@/api/dto";
import { getAlbum, makeThumbnailURL } from "@/api/endpoints";
import AlbumArt from '@/components/AlbumArt.vue';
import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import Draggable from '@/components/basic/Draggable.vue';
import Error from '@/components/basic/Error.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Spinner from '@/components/basic/Spinner.vue';
import AlbumDragPreview from '@/components/library/AlbumDragPreview.vue';
import AlbumSong from '@/components/library/AlbumSong.vue';
import { DndPayloadAlbum } from "@/dnd";
import { formatTitle, isFakeArtist } from "@/format";
import { makeArtistURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";

/* TODOS
Song multiselect
Song double-click
Song drag and drop
Dark mode (WIP)
Context menus
*/

const playback = usePlaybackStore();
const router = useRouter();

const props = defineProps<{ albumKey: AlbumKey }>();

const { state: fetchedAlbum, isLoading, error, execute: fetchAlbum } = useAsyncState(
	(key: AlbumKey) => getAlbum(key),
	undefined,
	{ immediate: false, resetOnExecute: true }
);

watchImmediate(() => props.albumKey, () => {
	fetchAlbum(0, props.albumKey);
});

const header = computed((): string => {
	return props.albumKey.name || "Unknown Album";
});

const artworkURL = computed(() => fetchedAlbum.value?.artwork ? makeThumbnailURL(fetchedAlbum.value.artwork, "large") : undefined);

const discs = computed(() => {
	if (!fetchedAlbum.value) {
		return undefined;
	}
	let discs = new Map<number | undefined, Song[]>();
	for (const song of fetchedAlbum.value.songs) {
		let disc = discs.get(song.disc_number);
		if (!disc) {
			disc = [];
			discs.set(song.disc_number, disc);
		}
		disc.push(song);
	}
	return discs;
});

const genres = computed(() => {
	if (!fetchedAlbum.value) {
		return undefined;
	}
	let counts = new Map<string, number>();
	for (const song of fetchedAlbum.value.songs) {
		for (const genre of song.genres || []) {
			counts.set(genre, 1 + (counts.get(genre) || 0));
		}
	}
	let names = [...counts.keys()];
	names.sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
	return names;
});

function onArtistClicked(name: string) {
	if (!isFakeArtist(name)) {
		router.push(makeArtistURL(name));
	}
}

async function play() {
	const songs = await listSongs();
	playback.clear();
	playback.queueTracks(songs);
	playback.next();
}

async function queue() {
	const songs = await listSongs();
	playback.queueTracks(songs);
}

async function listSongs() {
	if (fetchedAlbum.value) {
		return fetchedAlbum.value.songs.map(s => s.path);
	}
	return getAlbum(props.albumKey).then(a => a.songs.map(s => s.path));
}
</script>
