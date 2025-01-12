<template>

	<div class="flex flex-col py-8 pl-16 pr-8 bg-ls-0 dark:bg-ds-900">

		<PageTitle :label="playlistName">
			<template #right>
				<div class="relative flex gap-2">
					<Button label="Clear" severity="secondary" icon="clear" data-pw="clear-playlist"
						@click="playback.clear" :disabled="isEmpty" />
					<Button label="Stats" severity="secondary" icon="bar_chart" data-pw="show-playlist-stats"
						@click="showStats = true" :disabled="isEmpty" />
					<Button label="Save" severity="secondary" icon="save" data-pw="save-playlist"
						@click="savingPlaylist = true" :disabled="isEmpty" />

					<ScreenFade>
						<ScreenDarkening v-if="savingPlaylist" class="z-10" />
					</ScreenFade>

					<Transition appear name="slide">
						<div v-if="savingPlaylist" v-on-click-outside="cancelSavePlaylist" class="z-10 absolute right-0 -bottom-2 w-80 translate-y-full
							rounded-md
							bg-ls-0 dark:bg-ds-950
							shadow-lg shadow-accent-600/20	
							dark:shadow-none dark:border dark:border-ds-800
							">
							<form @submit.prevent="savePlaylist" class="relative p-6 flex flex-col gap-4">
								<InputText v-model="playlistName" id="playlistName" label="Playlist Name" autofocus />
								<Button type="submit" label="Save" severity="primary" icon="save"
									data-pw="submit-save-playlist" />
								<div class="absolute right-2 top-2">
									<Button icon="close" severity="tertiary" @click="cancelSavePlaylist" />
								</div>
							</form>
						</div>
					</Transition>

					<SidePanel v-model="showStats">
						<Stats />
					</SidePanel>
				</div>
			</template>
		</PageTitle>

		<div class="mb-8 flex items-center justify-between">
			<div class="flex gap-4">
				<Select class="w-48" v-model="playbackOrder" :options="playbackOrderOptions" />
				<Button label="Shuffle" severity="secondary" size="base" icon="shuffle" @click="playback.shuffle" />
			</div>
			<!-- TODO tooltips -->
			<Switch v-model="preferences.playlistDisplayMode"
				:items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
		</div>

		<div data-pw="playlist-songs" class="grow relative min-h-0">
			<OrderableList ref="orderableList" class="h-full -ml-8 -mr-4 pr-4" :items="playback.playlist"
				:item-height="itemHeight" :show-drop-preview="activeDnD != undefined" @keydown="onKeyDown"
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
import { vOnClickOutside } from '@vueuse/components'

import BlankStateFiller from "@/components/basic/BlankStateFiller.vue"
import Button from "@/components/basic/Button.vue"
import InputText from "@/components/basic/InputText.vue"
import PageTitle from '@/components/basic/PageTitle.vue';
import ScreenDarkening from '@/components/basic/ScreenDarkening.vue';
import ScreenFade from "@/components/basic/ScreenFade.vue"
import Select, { SelectOption } from '@/components/basic/Select.vue';
import Switch from '@/components/basic/Switch.vue';
import OrderableList from '@/components/basic/OrderableList.vue';
import SidePanel from '@/components/basic/SidePanel.vue';
import PlaylistSong from '@/components/playback/PlaylistSong.vue';
import Stats from '@/components/playback/Stats.vue';
import { useDragAndDrop } from '@/dnd';
import { usePlaybackStore, PlaylistEntry, PlaybackOrder } from '@/stores/playback';
import { usePlaylistsStore } from "@/stores/playlists";
import { usePreferencesStore } from "@/stores/preferences";

const playback = usePlaybackStore();
const playlists = usePlaylistsStore();
const preferences = usePreferencesStore();

const orderableList = useTemplateRef("orderableList");

const compact = computed(() => preferences.playlistDisplayMode == "compact");
const itemHeight = computed(() => compact.value ? 32 : 48);

const savingPlaylist = ref(false);
const playlistName = computed({
	get: () => playback.name || "New Playlist",
	set: (value) => playback.setName(value),
});

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

const showStats = ref(false);

const { activeDnD } = useDragAndDrop();

onMounted(() => autoScroll("instant"));
watch(() => playback.currentTrack, () => autoScroll("smooth"));

const isEmpty = computed(() => playback.playlist.length == 0);

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
	if (activeDnD.value) {
		playback.queueTracks(await activeDnD.value.getTracks(), atIndex);
	}
}

function savePlaylist() {
	savingPlaylist.value = false;
	playlists.save();
}

function cancelSavePlaylist() {
	savingPlaylist.value = false;
}
</script>

<style lang="css" scoped>
.slide-enter-active,
.slide-leave-active {
	transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
	translate: 20px 0;
	opacity: 0;
}
</style>