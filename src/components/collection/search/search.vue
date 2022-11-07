<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Search</h2>
			<SearchInput />
		</div>
		<div v-if="query && results" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ results.length }} results found for '{{ query }}'</div>
				<button v-if="results.length > 0" v-on:click="queueAll" class="small">Queue All</button>
			</div>
			<Explorer v-bind:items="results" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, Ref, watch} from "vue";
import { useRouter } from "vue-router";
import {CollectionItem, Directory, Song} from "@/api/dto"
import {search} from "@/api/endpoints"
import { usePlaylistStore } from "@/stores/playlist";
import Explorer from "@/components/collection/layout/Explorer.vue"
import SearchInput from "./SearchInput.vue"

const props = defineProps<{
	query: string
}>();

const router = useRouter();
const playlist = usePlaylistStore();

const results: Ref<CollectionItem[] | null> = ref(null);

watch(
	() => props.query,
	async (query) => {
		results.value = null;
		results.value = await search(query);
	},
	{immediate: true}
);

function queueAll() {
	let songItems: Song[] = [];
	let directoryItems: Directory[] = [];
	if (!results.value) {
		return;
	}

	results.value.forEach(item => {
		if (item.variant == "Song") {
			songItems.push({...item});
		} else if (item.variant == "Directory") {
			directoryItems.push(item);
		}
	});

	playlist.queueTracks(songItems);
	directoryItems.forEach(item => {
		playlist.queueDirectory(item.path);
	});
}

function onItemClicked(item: CollectionItem) {
	const variant = item.variant;
	if (variant == "Directory") {
		router.push("/browse/" + item.path).catch(err => {});
	} else if (variant == "Song") {
		playlist.queueTracks([{...item}]);
	}
}

function onItemsDragStart(event: DragEvent, items: CollectionItem[]) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}
</script>
