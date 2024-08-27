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

		<div class="grow relative min-h-0">
			<OrderableList ref="orderableList" class="h-full" :class="{ '-mx-2': !compact }" :items="playlist.entries"
				:item-height="itemHeight" :show-drop-preview="dragPayload != undefined" @list-reorder="onReorder"
				@list-drop="onDrop" @keydown="onKeyDown">
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
			<div v-if="!playlist.entries.length"
				class="pointer-events-none absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center text-center">
				<div>
					<span class="material-icons-round text-5xl text-ls-400">queue</span>
					<p class="mt-1 text-sm leading-6 text-ls-500">
						Make a playlist by dragging music<br />from your collection to here.
					</p>
				</div>
			</div>
		</div>

	</div>

</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { ComponentExposed } from "vue-component-type-helpers";

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

const orderableList: Ref<ComponentExposed<typeof OrderableList<PlaylistEntry>> | null> = ref(null);

// TODO save to preferences
const listMode = ref("compact");
const compact = computed(() => listMode.value == "compact");
const itemHeight = computed(() => compact.value ? 32 : 48);

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

function onKeyDown(event: KeyboardEvent) {
	switch (event.code) {
		case 'Delete':
			if (orderableList.value) {
				playlist.removeTracks(orderableList.value.selection);
			}
			break;
	}
}
</script>
