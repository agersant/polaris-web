<template>

	<div class="flex flex-col py-8 pl-8 xl:pl-16 pr-8 bg-ls-0 dark:bg-ds-900">

		<div class="relative flex gap-2">
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
						<Button type="submit" :disabled="!playlistName" label="Save" severity="primary" icon="save"
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

		<PageHeader :title="playlistName || 'New Playlist'" :actions="pageActions" />

		<div class="mb-8 flex items-center justify-between">
			<div class="flex gap-4">
				<Select class="w-40 xl:w-48" v-model="playbackOrder" :options="playbackOrderOptions" />
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
						:selected="selected" :focused="focused"
						@contextmenu="(e: MouseEvent) => onSongRightClicked(e, item)" />
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
			<ContextMenu ref="contextMenu" :items="contextMenuItems" />
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
import { computed, defineAsyncComponent, nextTick, onMounted, ref, useTemplateRef, watch } from "vue";
import { vOnClickOutside } from '@vueuse/components'
import { useRouter } from "vue-router";

import BlankStateFiller from "@/components/basic/BlankStateFiller.vue"
import Button from "@/components/basic/Button.vue"
import ContextMenu, { ContextMenuItem } from "@/components/basic/ContextMenu.vue"
import InputText from "@/components/basic/InputText.vue"
import PageHeader from '@/components/basic/PageHeader.vue';
import ScreenDarkening from '@/components/basic/ScreenDarkening.vue';
import ScreenFade from "@/components/basic/ScreenFade.vue"
import Select, { SelectOption } from '@/components/basic/Select.vue';
import Switch from '@/components/basic/Switch.vue';
import OrderableList from '@/components/basic/OrderableList.vue';
import SidePanel from '@/components/basic/SidePanel.vue';
import PlaylistSong from '@/components/playback/PlaylistSong.vue';
import { useDragAndDrop } from '@/dnd';
import { makeAlbumURLFromSongPaths } from "@/router";
import { usePlaybackStore, PlaylistEntry, PlaybackOrder } from '@/stores/playback';
import { usePlaylistsStore } from "@/stores/playlists";
import { usePreferencesStore } from "@/stores/preferences";
import { useSongsStore } from "@/stores/songs";

const Stats = defineAsyncComponent(() =>
	import('@/components/playback/Stats.vue')
)

const playback = usePlaybackStore();
const playlists = usePlaylistsStore();
const preferences = usePreferencesStore();
const router = useRouter();
const songs = useSongsStore();

const orderableList = useTemplateRef("orderableList");

const compact = computed(() => preferences.playlistDisplayMode == "compact");
const itemHeight = computed(() => compact.value ? 32 : 48);

const savingPlaylist = ref(false);
const playlistName = computed({
	get: () => playback.name,
	set: (value) => playback.setName(value),
});

const isEmpty = computed(() => playback.playlist.length == 0);

const pageActions = computed(() => [
	{ label: "Clear", icon: "clear", action: playback.clear, disabled: isEmpty.value, testID: "clear-playlist" },
	{ label: "Stats", icon: "bar_chart", action: () => { showStats.value = true }, disabled: isEmpty.value, testID: "show-playlist-stats" },
	{ label: "Save", icon: "save", action: () => { savingPlaylist.value = true }, disabled: isEmpty.value, testID: "save-playlist" },
]);

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

function onSongRightClicked(event: MouseEvent, entry: PlaylistEntry) {
	if (!orderableList.value?.isSelected(entry.key)) {
		orderableList.value?.selectItem(entry);
	}
	contextMenu.value?.show(event);
}

const contextMenu = useTemplateRef("contextMenu");
const contextMenuItems = computed(() => {
	const selection = orderableList.value?.selection || [];
	const items: ContextMenuItem[] = [
		{ label: "Remove", shortcut: "Del", action: () => { playback.removeTracks(selection) } },
	];

	const selectedSongs = selection.map(s => s.path);
	const albumURL = makeAlbumURLFromSongPaths(selectedSongs);
	if (albumURL) {
		items.push({ label: "View Album", action: () => { router.push(albumURL); } });
	}

	return items;
});

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