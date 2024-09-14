<template>
	<div class="flex flex-col whitespace-nowrap">
		<PageTitle :label="header" />
		<div class="mb-8">
			<span v-for="artist of albumKey.artists">
				{{ artist }}
			</span>
		</div>
		<div v-if="fetchedAlbum" class="grow min-h-0 flex flex-col">
			<div class="min-h-0 flex items-start gap-8">
				<div class="basis-2/5">
					<!-- TODO wrong aspect ratio while loading -->
					<AlbumArt :url="artworkURL" />
				</div>
				<div class="grow -mr-4 pr-4 self-stretch overflow-scroll flex flex-col">
					<div v-for="song of fetchedAlbum.songs" class="flex gap-4">
						<div class="w-6 text-right text-ls-500" v-text="`${song.track_number}.`" />
						<div class="grow mb-2 pb-2 text-ls-700 whitespace-normal border-b" v-text="formatTitle(song)" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, } from "vue";
import { useAsyncState, watchImmediate } from "@vueuse/core";

import { AlbumKey } from "@/api/dto";
import { getAlbum, makeThumbnailURL } from "@/api/endpoints";
import AlbumArt from '@/components/AlbumArt.vue';
import PageTitle from '@/components/basic/PageTitle.vue';
import { formatTitle } from "@/format";

/* TODOS
Genres
Year
Disc headers
Song artists
Artist links
Loading state
Error state
Play buttons
Art drag and drop
Song multiselect
Song drag and drop
Dark mode
Context menus
*/

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
</script>
