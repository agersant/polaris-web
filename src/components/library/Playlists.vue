<template>
	<div class="flex flex-col">
		<PageHeader title="Playlists" caption="Listen to your saved playlists." />
		<div v-if="playlists.listing.length" class="grow min-h-0 flex flex-col">
			<InputText class="mb-8" v-model="filter" id="filter" placeholder="Filter" icon="filter_alt" autofocus
				clearable />
			<div ref="viewport" class="-mx-4 px-4 overflow-y-auto whitespace-nowrap">
				<div v-if="filtered?.length" class="flex flex-col overflow-x-hidden
                divide-y divide-ls-200 dark:divide-ds-700">
					<div v-for="playlist in filtered" :key="playlist.name" data-pw="saved-playlist"
						class="flex items-center first:pt-1 py-4 gap-4">
						<Button icon="play_arrow" severity="secondary" @click="play(playlist)" />
						<div class="basis-fit shrink min-w-0 pr-8 flex flex-col">
							<span @click="onPlaylistClicked(playlist)" class="cursor-pointer
								font-semibold text-sm
                                overflow-hidden text-ellipsis
                                text-ls-700 dark:text-ds-300
                                hover:text-accent-600 hover:underline">
								{{ playlist.name }}
							</span>
							<span class="mt-1 text-xs text-ls-500 dark:text-ds-500"
								v-text="formatLongDuration(playlist.duration)" />
						</div>
						<div
							class="hidden xl:inline-flex basis-1/4 grow shrink-[10] overflow-hidden max-h-14 flex-wrap justify-end gap-2">
							<Badge v-for="genre of getMainGenres(playlist)" :label="genre" auto-color
								@click="onGenreClicked(genre)" />
						</div>
					</div>
				</div>
				<div v-else class="grow flex mt-40 justify-center text-center">
					<BlankStateFiller icon="filter_alt_off">
						No playlists match this filter.
					</BlankStateFiller>
				</div>
			</div>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner />
		</div>

		<Error v-else-if="error">
			Something went wrong while listing playlists.
		</Error>

		<div v-else-if="!playlists.listing.length" class="grow flex mt-40 justify-center text-center">
			<BlankStateFiller icon="music_off">
				No playlists have been saved.
			</BlankStateFiller>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";

import { PlaylistHeader } from "@/api/dto";
import { getPlaylist } from "@/api/endpoints";
import Badge from "@/components/basic/Badge.vue";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Button from "@/components/basic/Button.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Spinner from "@/components/basic/Spinner.vue";
import PageHeader from "@/components/basic/PageHeader.vue";
import { formatLongDuration } from "@/format";
import { saveScrollState, useHistory } from "@/history";
import { makeGenreURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";
import { usePlaylistsStore } from "@/stores/playlists";

const router = useRouter();
const playback = usePlaybackStore();
const playlists = usePlaylistsStore();

const isLoading = ref(false);
const error = ref(false);

onMounted(async () => {
	try {
		isLoading.value = true;
		await playlists.fetchList();
	} catch (e) {
		error.value = true;
	}
	isLoading.value = false;
});

const viewport = useTemplateRef("viewport");

const filter = ref("");

const filtered = computed(() => {
	if (!playlists.listing) {
		return undefined;
	}
	const query = filter.value.toLowerCase();
	return playlists.listing.filter(p => p.name.toLowerCase().includes(query));
});

function getMainGenres(playlist: PlaylistHeader) {
	let genres = Object.entries(playlist.num_songs_by_genre).map(([genre, count]) => ({ genre, count }));
	genres.sort((a, b) => {
		if (a.count != b.count) {
			return a.count - b.count
		} else {
			return a.genre < b.genre ? 1 : -1;
		}
	}).reverse();
	let displayGenres = genres.slice(0, 5).map(({ genre }) => genre);
	return displayGenres;
}

async function play(playlist: PlaylistHeader) {
	const songs = (await getPlaylist(playlist.name)).songs.paths;
	playback.clear();
	playback.stop();
	playback.queueTracks(songs);
	playback.setName(playlist.name);
}

function onPlaylistClicked(playlist: PlaylistHeader) {
	router.push("/playlists/" + encodeURIComponent(playlist.name)).catch(err => { });
}

function onGenreClicked(name: string) {
	router.push(makeGenreURL(name));
}

useHistory("playlists", [filter, saveScrollState(viewport)]);
</script>
