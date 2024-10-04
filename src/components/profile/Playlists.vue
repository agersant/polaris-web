<template>
	<div class="flex flex-col">
		<PageTitle label="Playlists" />
		<div class="grow min-h-0 overflow-scroll">
			<div v-if="listing?.length">
				<div v-for="(playlist, index) in listing" @key="index" @click="onPlaylistClicked(playlist)">
					{{ playlist.name }}
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
import { useRouter } from "vue-router";
import { useAsyncState } from "@vueuse/core";

import { ListPlaylistsEntry } from "@/api/dto";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import Spinner from "@/components/basic/Spinner.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import { usePlaylistsStore } from "@/stores/playlists";

// TODO presentation
// TODO drag and drop playlist

const router = useRouter();
const playlists = usePlaylistsStore();

const { state: listing, isLoading, error } = useAsyncState(playlists.refresh, undefined);

function onPlaylistClicked(playlist: ListPlaylistsEntry) {
	router.push("/playlist/" + encodeURIComponent(playlist.name)).catch(err => { });
}

</script>
