<template>
	<div class="flex flex-col">
		<PageTitle :label="header" :actions="pageActions" class="hidden xl:inline-flex" />

		<div v-if="album" class="grow min-h-0 flex flex-col gap-8 xl:gap-0">

			<div class="flex flex-row gap-4 items-start mt-11 xl:basis-10 shrink-0 xl:mb-8 xl:mt-0">
				<div class="flex flex-col basis-[105px] shrink-0 xl:hidden">
					<Draggable :make-payload="() => new DndPayloadAlbum(album as AlbumDTO)" class="cursor-grab">
						<AlbumArt :url="artworkURL" size="md" class="shadow-lg shadow-ls-100 dark:shadow-ds-900" />
						<template #drag-preview>
							<AlbumDragPreview :album="album" />
						</template>
					</Draggable>
				</div>
				<div
					class="xl:grow xl:shrink-1 self-stretch flex flex-col items-start gap-2 xl:flex-row xl:items-center xl:gap-6">
					<div class="xl:hidden">
						<span v-text="`${albumKey.name}`" class="text-md" />
						<span v-if="album.year" v-text="` (${album.year})`"
							class="text-xs italic text-ls-500 dark:text-ds-400" />
					</div>
					<div class="xl:shrink-[1] text-xs xl:text-sm uppercase font-medium text-ls-500 dark:text-ds-400">
						<span v-text="`By `" />
						<span v-for="(artist, index) of albumKey.artists" class="inline-flex">
							<span v-text="artist" :class="isFakeArtist(artist) ? '' :
								'cursor-pointer underline text-accent-600 dark:text-accent-700'" @click="onArtistClicked(artist)" />
							<span v-if="index == albumKey.artists.length - 2">&nbsp;&&nbsp;</span>
							<span v-else-if="index < albumKey.artists.length - 1">,&nbsp;</span>
						</span>
					</div>
					<div
						class="xl:shrink-[2] xl:grow max-h-6 overflow-hidden flex flex-wrap self-start xl:self-center xl:justify-end gap-2">
						<Badge v-for="genre of genres" :label="genre" :auto-color="true"
							@click="onGenreClicked(genre)" />
					</div>
				</div>
			</div>

			<!-- TODO allow PageTitle to replace label with/ custom widget and re-use Actions instead of duplicating buttons here -->
			<div class="flex gap-2 basis-10 shrink-0 xl:hidden">
				<Button label="Play All" severity="secondary" icon="play_arrow" data-pw="play-all" @click="play"
					class="grow" />
				<Button label="Queue All" severity="secondary" icon="playlist_add" data-pw="queue-all" @click="queue"
					class="grow" />
			</div>

			<div class="min-h-0 flex items-start gap-8">
				<div class="basis-2/5 shrink-0 hidden xl:block">
					<Draggable :make-payload="() => new DndPayloadAlbum(album as AlbumDTO)" class="cursor-grab">
						<AlbumArt :url="artworkURL" size="lg" class="shadow-lg shadow-ls-100 dark:shadow-ds-900" />
						<template #drag-preview>
							<AlbumDragPreview :album="album" />
						</template>
					</Draggable>
					<div v-text="`${albumKey.name} (${album.year})`"
						class="mt-3 px-4 italic text-ls-500 dark:text-ds-400 text-xs text-center" />
				</div>
				<div ref="viewport" class="grow -m-4 mb-0 p-4 self-stretch overflow-y-auto flex flex-col gap-8"
					tabindex="-1" @keydown="onKeyDown">
					<div v-for="[discNumber, songs] of discs" class="flex flex-col">
						<SectionTitle v-if="discs?.size && discNumber" icon="numbers" :label="`Disc ${discNumber}`" />
						<Draggable :make-payload="() => new DndPayloadSongs(selection)" v-for="(song, index) of songs"
							@draggable-start="onDragStart($event, song)" :allow-pointer-events-inside="true">
							<AlbumSong ref="albumSongs" :song="song" :selected="selectedKeys.has(song.path)"
								:focused="focusedKey == song.path" :is-last="index == songs.length - 1"
								@click="clickItem($event, { key: song.path, ...song })"
								@dblclick="onSongDoubleClicked(song)" />
							<template #drag-preview="{ payload }">
								<div class="flex items-center gap-2">
									<span v-text="`music_note`" class="material-icons-round" />
									<span v-text="payload.getDescription()" />
								</div>
							</template>
						</Draggable>
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner />
		</div>

		<Error v-else-if="error">
			Something went wrong while listing songs.
		</Error>
	</div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch, } from "vue";
import { useAsyncState } from "@vueuse/core";
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
import { DndPayloadAlbum, DndPayloadSongs } from "@/dnd";
import { isFakeArtist } from "@/format";
import { saveScrollState, useHistory } from "@/history";
import { makeArtistURL, makeGenreURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";
import { useSongsStore } from "@/stores/songs";
import useMultiselect from "@/multiselect";

// TODO Context menus

const playback = usePlaybackStore();
const songs = useSongsStore();
const router = useRouter();

const props = defineProps<{ albumKey: AlbumKey }>();

const viewport = useTemplateRef("viewport");
const albumSongs = useTemplateRef("albumSongs");

const { state: album, isLoading, error, execute: fetchAlbum } = useAsyncState(
	(key: AlbumKey) => getAlbum(key),
	undefined,
	{ immediate: false, resetOnExecute: true }
);

const header = computed((): string => {
	return props.albumKey.name || "Unknown Album";
});

const pageActions = [
	{ label: "Play All", icon: "play_arrow", action: play, testID: "play-all" },
	{ label: "Queue All", icon: "playlist_add", action: queue, testID: "queue-all" },
];

const artworkURL = computed(() => album.value?.artwork ? makeThumbnailURL(album.value.artwork, "large") : undefined);

const discs = computed(() => {
	if (!album.value) {
		return undefined;
	}
	let discs = new Map<number | undefined, Song[]>();
	for (const song of album.value.songs) {
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
	if (!album.value) {
		return undefined;
	}
	let counts = new Map<string, number>();
	for (const song of album.value.songs) {
		for (const genre of song.genres || []) {
			counts.set(genre, 1 + (counts.get(genre) || 0));
		}
	}
	let names = [...counts.keys()];
	names.sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
	return names;
});

const { clickItem, selection, selectItem, selectedKeys, focusedKey, multiselect, pivotKey } = useMultiselect(
	() => {
		return album.value?.songs.map(s => ({ key: s.path, ...s })) || [];
	},
	{ onMove: snapScrolling }
);

if (!useHistory("album", [album, selectedKeys, focusedKey, pivotKey, saveScrollState(viewport)])) {
	fetchAlbum(0, props.albumKey);
} else {
	songs.ingest(album.value?.songs ?? []);
}

watch(() => props.albumKey, () => {
	fetchAlbum(0, props.albumKey);
});

async function play() {
	const songs = await listSongs();
	playback.clear();
	playback.stop();
	playback.queueTracks(songs);
}

async function queue() {
	const songs = await listSongs();
	playback.queueTracks(songs);
}

async function listSongs() {
	if (album.value) {
		return album.value.songs.map(s => s.path);
	}
	return getAlbum(props.albumKey).then(a => a.songs.map(s => s.path));
}

function onArtistClicked(name: string) {
	if (!isFakeArtist(name)) {
		router.push(makeArtistURL(name));
	}
}

function onGenreClicked(name: string) {
	router.push(makeGenreURL(name));
}

function onSongDoubleClicked(song: Song) {
	playback.clear();
	playback.stop();
	playback.queueTracks([song.path]);
}

function onDragStart(event: DragEvent, song: Song) {
	if (!selectedKeys.value.has(song.path)) {
		selectItem({ key: song.path, ...song });
	}
}

function onKeyDown(event: KeyboardEvent) {
	multiselect.onKeyDown(event);
	if (event.code == "Enter") {
		queueSelection(!event.shiftKey);
	}
}

async function queueSelection(replace: boolean) {
	const tracks = selection.value.map(s => s.path);
	if (!tracks.length) {
		return;
	}

	if (replace) {
		playback.clear();
		playback.stop();
	}
	playback.queueTracks(tracks);
}

function snapScrolling() {
	if (!viewport.value) {
		return;
	}

	const songElement = albumSongs.value?.find(s => s?.song.path == focusedKey.value);
	if (!songElement) {
		return;
	}

	const viewportTop = viewport.value.scrollTop;
	const viewportHeight = viewport.value.clientHeight;
	const viewportBottom = viewportTop + viewportHeight;

	const elementTop = (songElement.$el as HTMLElement).offsetTop - viewport.value.offsetTop;
	const elementHeight = (songElement.$el as HTMLElement).offsetHeight;
	const elementBottom = elementTop + elementHeight;

	const padding = 4 * elementHeight;

	let scrollY = viewportTop;
	if (elementTop < viewportTop + padding) {
		scrollY = Math.min(scrollY, elementTop - padding);
	} else if (elementBottom > viewportBottom - padding) {
		scrollY = Math.max(scrollY, elementTop - viewportHeight + padding);
	}

	viewport.value.scrollTo({ top: scrollY, behavior: "instant" });
}

</script>
