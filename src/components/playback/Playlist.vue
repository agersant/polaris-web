<template>

	<div class="flex flex-col border-l pt-10 select-none bg-ls-0 dark:bg-ds-900">

		<div class="m-6 mx-4 flex items-center justify-between">
			<div class="flex items-center gap-1">
				<span class="-mt-0.5 text-2xl font-light text-ls-500 italic dark:text-ds-300">
					{{ playlist.name || "New Playlist" }}
				</span>
				<!-- TODO find a better layout. Clearing playlist makes buttons move -->
				<span class="ml-1 font-light text-sm text-ls-600" v-if="duration > 0">
					{{ formatLongDuration(duration) }}
				</span>
				<!-- TODO save functionality -->
				<Button class="ml-2" label="Save" text severity="secondary" icon="save" />
				<Button label="Clear" text severity="secondary" icon="clear" @click="playlist.clear" />
			</div>
			<div class="flex items-center gap-2">
				<Button label="Shuffle" text severity="secondary" size="lg" icon="shuffle" @click="playlist.shuffle" />
				<MultiSwitch size="sm" v-model="listMode"
					:items="[{ icon: 'list', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
				<!-- TODO playback order -->
				<!-- <Select placeholder="Repeat All" /> -->
			</div>
		</div>

		<div class="w-full px-4 pt-1 py-3 text-ls-700 flex text-xs font-semibold whitespace-nowrap">
			<div class="grow basis-0 pr-4">Artist - Album</div>
			<div v-if="!compact" class="basis-10 shrink-0 mr-3" />
			<div class="basis-8 shrink-0 text-right mr-2">#</div>
			<div class="grow basis-0 pr-4">Song</div>
			<div class="basis-16 shrink-0 text-right">Duration</div>
		</div>

		<OrderableList class="grow border-t border-ls-200" :items="playlist.entries" :item-height="itemHeight"
			:show-drop-preview="dragPayload != undefined" @list-reorder="onReorder" @list-drop="onDrop">

			<template #default="{ item, index, selected, focused }">
				<PlaylistSong :path="item.path" :compact="compact" :height="itemHeight" :index="index"
					:selected="selected" :focused="focused" />
			</template>

			<template #drop-preview>
				<div class="flex items-stretch px-1.5 py-1" :style="{ height: `${itemHeight}px` }">
					<div
						class="grow flex items-center place-content-center rounded-sm bg-accent-100 text-accent-600 outline-1 outline-dashed outline-accent-600">
						<span class="material-icons-round">add</span>
					</div>
				</div>
			</template>

		</OrderableList>

	</div>

</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import Button from "@/components/basic/Button.vue"
import MultiSwitch from '@/components/basic/MultiSwitch.vue';
import OrderableList from '@/components/basic/OrderableList.vue';
import PlaylistSong from '@/components/playback/PlaylistSong.vue';
import { useDragAndDrop } from '@/dnd';
import { formatLongDuration } from "@/format";
import { usePlaylistStore, PlaylistEntry } from '@/stores/playlist';
import { useSongsStore } from "@/stores/songs";

const playlist = usePlaylistStore();
const songs = useSongsStore();

// TODO save to preferences
const listMode = ref("compact");
const compact = computed(() => listMode.value == "compact");

const itemHeight = computed(() => compact.value ? 32 : 50);

const { payload: dragPayload } = useDragAndDrop();

const duration = computed(() => playlist.entries.reduce((acc, entry) => {
	const song = songs.cache.get(entry.path);
	if (!song || !song.duration || isNaN(song.duration)) {
		return acc;
	}
	return acc + song.duration;
}, 0));

function onReorder(tracks: PlaylistEntry[], newIndex: number) {
	playlist.reorder(tracks, newIndex);
}

async function onDrop(atIndex: number) {
	if (dragPayload.value) {
		playlist.queueTracks(await dragPayload.value.getTracks(), atIndex);
	}
}

</script>
