<template>

	<div class="flex flex-col py-8 px-16 border-l select-none bg-ls-0 dark:bg-ds-900">

		<SectionTitle :label="playlist.name || 'New Playlist'">
			<template #right>
				<div class="flex gap-3">
					<Button label="Clear" severity="secondary" icon="clear" @click="playlist.clear" />
					<Button label="Save" severity="secondary" icon="save" />
				</div>
			</template>
		</SectionTitle>

		<div class="mt-8 mb-4 flex items-center justify-between">
			<div class="flex gap-4">
				<Select class="w-48" v-model="playbackOrder" :options="playbackOrderOptions" />
				<Button label="Shuffle" severity="secondary" size="base" icon="shuffle" @click="playlist.shuffle" />
			</div>
			<MultiSwitch size="sm" v-model="listMode"
				:items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
		</div>

		<OrderableList class="grow" :class="{ '-mx-2': !compact }" :items="playlist.entries" :item-height="itemHeight"
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
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Select from '@/components/basic/Select.vue';
import OrderableList from '@/components/basic/OrderableList.vue';
import PlaylistSong from '@/components/playback/PlaylistSong.vue';
import { useDragAndDrop } from '@/dnd';
import { usePlaylistStore, PlaylistEntry, PlaybackOrder } from '@/stores/playlist';
import { SelectOption } from "../basic/Select.vue";

const playlist = usePlaylistStore();

// TODO save to preferences
const listMode = ref("compact");
const compact = computed(() => listMode.value == "compact");
const itemHeight = computed(() => compact.value ? 32 : 50);

const playbackOrderOptions: SelectOption<PlaybackOrder>[] = [
	{ label: "Play Once", value: "default" },
	{ label: "Play Randomly", value: "random" },
	{ label: "Repeat Song", value: "repeat-track" },
	{ label: "Repeat All", value: "repeat-all" },
];

const playbackOrder = computed({
	set(option: SelectOption<PlaybackOrder>) {
		playlist.setPlaybackOrder(option.value);
	},
	get() {
		return playbackOrderOptions.find(o => o.value == playlist.playbackOrder) || playbackOrderOptions[0];
	},
});

const { payload: dragPayload } = useDragAndDrop();

function onReorder(tracks: PlaylistEntry[], newIndex: number) {
	playlist.reorder(tracks, newIndex);
}

async function onDrop(atIndex: number) {
	if (dragPayload.value) {
		playlist.queueTracks(await dragPayload.value.getTracks(), atIndex);
	}
}
</script>
