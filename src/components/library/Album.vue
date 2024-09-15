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

			<div class="mb-8 flex items-center">
				<div class="flex flex-col">
					<div class="font-medium text-ls-700">
						<span v-text="`By `" />
						<span v-for="(artist, index) of albumKey.artists" class="inline-flex">
							<span v-text="artist" :class="isFakeArtist(artist) ? '' :
								'cursor-pointer underline text-accent-600 dark:text-accent-700'" @click="onArtistClicked(artist)" />
							<span v-if="index == albumKey.artists.length - 2">&nbsp;&&nbsp;</span>
							<span v-else-if="index < albumKey.artists.length - 1">,&nbsp;</span>
						</span>
					</div>
					<div v-if="fetchedAlbum.year" v-text="`${fetchedAlbum.year}`"
						class="text-ls-500 dark:text-ds-500" />
				</div>
				<div class="basis-0 grow max-h-14 ml-6 mt-1.5 overflow-hidden flex flex-wrap justify-end gap-2">
					<!-- TODO genre links -->
					<Badge v-for="genre of genres" :label="genre" :auto-color="true" />
				</div>
			</div>

			<div class="min-h-0 flex items-start gap-8">
				<div class="basis-2/5 shrink-0">
					<!-- TODO wrong aspect ratio while loading -->
					<AlbumArt :url="artworkURL" size="lg" class="shadow-lg shadow-ls-100" />
				</div>
				<div class="grow -mr-4 pr-4 self-stretch overflow-scroll flex flex-col gap-8">
					<div v-for="[discNumber, songs] of discs" class="flex flex-col">
						<SectionTitle v-if="discs?.size && discNumber" icon="numbers" :label="`Disc ${discNumber}`" />
						<div v-for="song of songs" class="group flex gap-4">
							<div class="w-6 text-right text-ls-700" v-text="`${song.track_number}.`" />
							<div class="grow mb-2 pb-2 text-ls-900 border-b group-last:border-0"
								v-text="formatTitle(song)" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, } from "vue";
import { useAsyncState, watchImmediate } from "@vueuse/core";
import { useRouter } from "vue-router";

import { AlbumKey, Song } from "@/api/dto";
import { getAlbum, makeThumbnailURL } from "@/api/endpoints";
import AlbumArt from '@/components/AlbumArt.vue';
import Badge from '@/components/basic/Badge.vue';
import Button from '@/components/basic/Button.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import { formatTitle, isFakeArtist } from "@/format";
import { makeArtistURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";

/* TODOS
Song artists w/ links
Loading state
Error state
Art drag and drop
Song multiselect
Song double-click
Song drag and drop
Dark mode
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
