<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Music Collection</h2>
			<Breadcrumbs />
		</div>

		<div data-cy="browser" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div data-cy="browser-header" class="header">{{ header }}</div>
				<div v-if="subHeader" class="subHeader">{{ subHeader }}</div>
				<button v-if="items.length > 0" v-on:click="onQueueAll" class="small">Queue All</button>
			</div>
			<Explorer v-if="viewMode == 'explorer'" v-bind:items="items" v-on:item-click="onItemClicked"
				v-on:items-drag-start="onItemsDragStart" />
			<Discography v-if="viewMode == 'discography'" v-bind:showArtistName="false" v-bind:directories="directories"
				v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart" />
			<Album v-if="viewMode == 'album'" v-bind:songs="songs" v-on:item-click="onItemClicked"
				v-on:items-drag-start="onItemsDragStart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { CollectionItem, Directory } from "@/api/dto";
import { browse } from "@/api/endpoints";
import { getPathTail } from "@/format";
import { usePlaylistStore } from "@/stores/playlist";
import { computed, nextTick, ref, Ref, watch } from "vue";
import { useRouter } from "vue-router";
import Breadcrumbs from "./Breadcrumbs.vue";
import Album from "./layout/Album.vue";
import Discography from "./layout/Discography.vue";
import Explorer from "./layout/Explorer.vue";

type ViewMode = "explorer" | "discography" | "album";

const props = defineProps<{path:string}>();

const router = useRouter();
const playlist = usePlaylistStore();

const items: Ref<CollectionItem[]> = ref([]);
const paneContent: Ref<HTMLElement | null> = ref(null);
const savedPositions = new Map();

watch(
	() => props.path,
	async (path, oldPath) => {
		if (oldPath && paneContent.value) {
			savedPositions.set(oldPath, paneContent.value.scrollTop);
		}
		items.value = (await browse(path)).sort((a, b) => a.path.localeCompare(b.path));
		for (const savedPath of savedPositions.keys()) {
			if (!path.startsWith(savedPath)) {
				savedPositions.delete(savedPath);
			}
		}
		nextTick(() => {
			if (paneContent.value) {
				paneContent.value.scrollTop = savedPositions.get(path) || 0;
			}
		});
	},
	{ immediate: true, flush: "post" }
);

const directories = computed(() => items.value.flatMap(i => i.variant == "Directory" ? [i] : []));
const songs = computed(() => items.value.flatMap(i => i.variant == "Song" ? [i] : []));

const header = computed((): string =>{
	let header: string | null = "";
	for (let item of items.value) {
		if (item.variant == "Song") {
			if (header && item.album && header != item.album) {
				header = null;
				break;
			} else {
				header = header || item.album;
			}
		}
	}
	return header || getPathTail(props.path) || "All Music";
});

const subHeader = computed((): string =>{
	let subHeader = "";
	for (let item of items.value) {
		if (item.variant == "Song") {
			subHeader = subHeader || item.album_artist || item.artist || "";
		}
	}
	return subHeader;
});

const viewMode = computed((): ViewMode => {
	let onlySongs = true;
	let onlyDirectories = true;
	let allSameAlbum = true;
	let allHaveAlbums = true;
	let hasAnyPicture = false;
	let album = null;

	for (let item of items.value) {
		if (!item.album) {
			allHaveAlbums = false;
		} else if (!album) {
			album = item.album;
		}
		if (item.artwork) {
			hasAnyPicture = true;
		}
		if (item.variant == "Song") {
			onlyDirectories = false;
			allSameAlbum = allSameAlbum && item.album == album;
		} else {
			onlySongs = false;
		}
	}

	if (onlySongs && hasAnyPicture && allSameAlbum && items.value.length > 0) {
		return "album";
	}
	if (onlyDirectories && hasAnyPicture && allHaveAlbums) {
		return "discography";
	}
	return "explorer";
});

function onItemClicked(item: CollectionItem) {
	if (item.variant == "Directory") {
		router.push("/browse/" + item.path).catch(err => { });
	} else if (item.variant == "Song") {
		playlist.queueTracks([{ ...item }]);
	}
}

function onItemsDragStart(event: DragEvent, items: CollectionItem[]) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}

function onQueueAll() {
	if (viewMode.value == "album") {
		const songs = items.value.flatMap(item => item.variant == "Song" ? [{...item}] : []);
		playlist.queueTracks(songs);
	} else {
		playlist.queueDirectory(props.path);
	}
}
</script>
