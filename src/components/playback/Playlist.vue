<template>

	<div
		class="flex flex-col py-8 pl-16 pr-8 border-l border-ls-200 dark:border-ds-700 select-none bg-ls-0 dark:bg-ds-900">

		<SectionTitle :label="playback.name || 'New Playlist'">
			<template #right>
				<div class="flex gap-2">
					<Button label="Clear" severity="secondary" icon="clear" @click="playback.clear" />
					<!-- TODO show playlist stats (duration, number of songs, songs per year bar chart? most represented artists? longest songs?) -->
					<Button label="Stats" severity="secondary" icon="bar_chart" />
					<!-- TODO save functionality -->
					<Button label="Save" severity="secondary" icon="save" />
				</div>
			</template>
		</SectionTitle>

		<div class="mb-8 flex items-center justify-between">
			<div class="flex gap-4">
				<Select class="w-48" v-model="playbackOrder" :options="playbackOrderOptions" />
				<Button label="Shuffle" severity="secondary" size="base" icon="shuffle" @click="playback.shuffle" />
			</div>
			<MultiSwitch v-model="listMode"
				:items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
		</div>

		<div class="grow relative min-h-0">
			<OrderableList ref="orderableList" class="h-full -ml-8 -mr-2" :items="playback.playlist"
				:item-height="itemHeight" :show-drop-preview="dragPayload != undefined" @keydown="onKeyDown"
				@list-reorder="onReorder" @list-delete="playback.removeTracks" @list-drop="onDrop">
				<template #default="{ item, index, selected, focused }">
					<PlaylistSong :entry="item" :compact="compact" :height="itemHeight" :index="index"
						:selected="selected" :focused="focused" />
				</template>
				<template #drop-preview>
					<div class="flex items-stretch pl-8 pr-2 py-1" :style="{ height: `${itemHeight}px` }">
						<div class="grow flex items-center place-content-center rounded-sm
							bg-accent-100 dark:bg-accent-900
							text-accent-700 dark:text-accent-300
							outline-accent-600 dark:outline-accent-700
							outline-1 outline-dashed">
							<span class="material-icons-round">add</span>
						</div>
					</div>
				</template>
			</OrderableList>
			<div v-if="!playback.playlist.length"
				class="pointer-events-none absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center text-center">
				<BlankStateFiller icon="queue">
					Make a playlist by dragging music<br />from your collection to here.
				</BlankStateFiller>
			</div>
		</div>

	</div>

</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";

import BlankStateFiller from "@/components/basic/BlankStateFiller.vue"
import Button from "@/components/basic/Button.vue"
import MultiSwitch from '@/components/basic/MultiSwitch.vue';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import Select from '@/components/basic/Select.vue';
import OrderableList from '@/components/basic/OrderableList.vue';
import PlaylistSong from '@/components/playback/PlaylistSong.vue';
import { useDragAndDrop } from '@/dnd';
import { usePlaybackStore, PlaylistEntry, PlaybackOrder } from '@/stores/playback';
import { SelectOption } from "../basic/Select.vue";

const playback = usePlaybackStore();

const orderableList = useTemplateRef("orderableList");

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
		playback.setPlaybackOrder(option.value);
	},
	get() {
		return playbackOrderOptions.find(o => o.value == playback.playbackOrder) || playbackOrderOptions[0];
	},
});

const { payload: dragPayload } = useDragAndDrop();

onMounted(() => autoScroll("instant"));
watch(() => playback.currentTrack, () => autoScroll("smooth"));

function autoScroll(scrollBehavior: ScrollBehavior) {
	nextTick(() => {
		if (!orderableList.value || !playback.currentTrack) {
			return;
		}
		if (orderableList.value.isIdle()) {
			orderableList.value.selectItem(playback.currentTrack);
			orderableList.value.snapScrolling("center", scrollBehavior);
		}
	});
}

function onReorder(tracks: PlaylistEntry[], newIndex: number) {
	playback.reorder(tracks, newIndex);
}

function onKeyDown(event: KeyboardEvent) {
	if (event.code == "Enter") {
		const entry = orderableList.value?.selection[0];
		if (entry) {
			playback.play(entry);
		}
	}
}

async function onDrop(atIndex: number) {
	if (dragPayload.value) {
		playback.queueTracks(await dragPayload.value.getTracks(), atIndex);
	}
}

</script>
