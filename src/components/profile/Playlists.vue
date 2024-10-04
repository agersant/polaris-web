<template>
	<div class="flex flex-col">
		<PageTitle label="Playlists" />
		<div class="grow min-h-0 -mx-4 px-4 overflow-y-scroll whitespace-nowrap">
			<div v-if="listing?.length">
				<InputText class="mb-8" v-model="filter" id="filter" name="filter" placeholder="Filter"
					icon="filter_alt" autofocus clearable />
				<div v-if="filtered?.length" class="grid grid-cols-2 gap-4">
					<Draggable v-for="playlist in filtered" @key="playlist.name"
						:make-payload="() => new DndPayloadPlaylist(playlist.name)" allow-pointer-events-inside
						@click="onPlaylistClicked(playlist)">
						<div class="cursor-pointer
							h-full flex items-center gap-4 p-4
							rounded-md border border-ls-200 dark:border-ds-700
							hover:bg-ls-100 hover:dark:bg-ds-700
							">
							<span class="material-icons-round rounded-full p-2
									flex items-center justify-center
									text-ls-500 dark:text-ds-400
									bg-ls-200 dark:bg-ds-700">
								playlist_play
							</span>
							<div class="flex flex-col min-w-0">
								<span v-text="playlist.name"
									class="font-medium text-ls-900 dark:text-ds-200 overflow-hidden text-ellipsis" />
								<span v-text="'20 songs'"
									class="text-sm text-ls-500 dark:text-ds-500 whitespace-nowrap overflow-hidden text-ellipsis" />
							</div>
						</div>
						<template #drag-preview>
							<div class="flex items-center gap-2">
								<span v-text="'playlist_play'" class="material-icons-round" />
								<span v-text="playlist.name" />
							</div>
						</template>
					</Draggable>
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

import { ListPlaylistsEntry } from "@/api/dto";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Draggable from "@/components/basic/Draggable.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import Spinner from "@/components/basic/Spinner.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import { DndPayloadPlaylist } from "@/dnd";
import { usePlaylistsStore } from "@/stores/playlists";

// TODO num songs
// TODO genres
// TODO copy layout from Artists page
// TODO persistence

const router = useRouter();
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

function onPlaylistClicked(playlist: ListPlaylistsEntry) {
	router.push("/playlist/" + encodeURIComponent(playlist.name)).catch(err => { });
}

</script>
