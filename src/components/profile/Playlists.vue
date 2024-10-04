<template>
	<div class="flex flex-col">
		<PageTitle label="Playlists" />
		<div class="grow min-h-0 overflow-scroll">
			<div v-if="listing?.length" class="grid grid-cols-3 gap-4 items-stretch">
				<Draggable v-for="playlist in listing" @key="playlist.name"
					:make-payload="() => new DndPayloadPlaylist(playlist.name)" allow-pointer-events-inside
					@click="onPlaylistClicked(playlist)">
					<div class="cursor-pointer overflow-hidden
					h-full flex items-center gap-4 px-3 p-4
					rounded-md border border-ls-200 dark:border-ds-700
					hover:bg-ls-100 hover:dark:bg-ds-700">
						<span class="material-icons-round rounded-full p-2
                            flex items-center justify-center
                            text-ls-500 dark:text-ds-400
                            bg-ls-200 dark:bg-ds-700">
							playlist_play
						</span>
						<div class="flex flex-col">
							<span v-text="playlist.name"
								class="line-clamp-2 font-medium text-ls-900 dark:text-ds-200 overflow-hidden text-ellipsis" />
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
import Draggable from "@/components/basic/Draggable.vue";
import Error from "@/components/basic/Error.vue";
import Spinner from "@/components/basic/Spinner.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import { DndPayloadPlaylist } from "@/dnd";
import { usePlaylistsStore } from "@/stores/playlists";

// TODO presentation

const router = useRouter();
const playlists = usePlaylistsStore();

const { state: listing, isLoading, error } = useAsyncState(playlists.refresh, undefined);

function onPlaylistClicked(playlist: ListPlaylistsEntry) {
	router.push("/playlist/" + encodeURIComponent(playlist.name)).catch(err => { });
}

</script>
