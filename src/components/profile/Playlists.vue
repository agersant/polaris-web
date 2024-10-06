<template>
	<div class="flex flex-col">
		<PageTitle label="Playlists" />
		<div class="grow min-h-0 -mx-4 px-4 overflow-y-scroll whitespace-nowrap">
			<div v-if="listing?.length">
				<InputText class="mb-8" v-model="filter" id="filter" name="filter" placeholder="Filter"
					icon="filter_alt" autofocus clearable />
				<div v-if="filtered?.length" class="flex flex-col overflow-x-hidden
                divide-y divide-ls-200 dark:divide-ds-700">
					<div v-for="playlist in filtered" :key="playlist.name"
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
							class="basis-1/4 grow shrink-[10] overflow-hidden flex max-h-14 flex-wrap justify-end gap-2">
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

			<div v-else-if="listing && !listing.length" class="grow flex mt-40 justify-center text-center">
				<BlankStateFiller icon="music_off">
					No playlists have been saved.
				</BlankStateFiller>
			</div>

			<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
				<Spinner class="text-ls-700 dark:text-ds-400" />
			</div>

			<Error v-else-if="error">
				Something went wrong while listing playlists.
			</Error>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAsyncState } from "@vueuse/core";

import { PlaylistHeader } from "@/api/dto";
import { getPlaylist } from "@/api/endpoints";
import Badge from "@/components/basic/Badge.vue";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Button from "@/components/basic/Button.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Spinner from "@/components/basic/Spinner.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import { formatLongDuration } from "@/format";
import { makeGenreURL } from "@/router";
import { usePlaybackStore } from "@/stores/playback";
import { usePlaylistsStore } from "@/stores/playlists";

// TODO persistence

const router = useRouter();
const playback = usePlaybackStore();
const playlists = usePlaylistsStore();

const { state: listing, isLoading, error } = useAsyncState(playlists.refresh, undefined);

const filter = ref("");

const filtered = computed(() => {
	if (!listing.value) {
		return undefined;
	}
	const query = filter.value.toLowerCase();
	return listing.value.filter(p => p.name.toLowerCase().includes(query));
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
	playback.queueTracks(songs);
	playback.setName(playlist.name);
	playback.next();
}

function onPlaylistClicked(playlist: PlaylistHeader) {
	router.push("/playlist/" + encodeURIComponent(playlist.name)).catch(err => { });
}

function onGenreClicked(name: string) {
	router.push(makeGenreURL(name));
}
</script>
