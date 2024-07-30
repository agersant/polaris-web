<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Music Collection</h2>
			<Breadcrumbs />
		</div>

		<div data-cy="browser" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div data-cy="browser-header" class="header">{{ header }}</div>
				<button v-if="items.length > 0" v-on:click="onQueueAll" class="small">Queue All</button>
			</div>
			<Explorer v-bind:items="items" v-on:item-click="onItemClicked"
				v-on:items-drag-start="onItemsDragStart" />			
		</div>
	</div>
</template>

<script setup lang="ts">
import { BrowserEntry } from "@/api/dto";
import { browse } from "@/api/endpoints";
import { getPathTail } from "@/format";
import { usePlaylistStore } from "@/stores/playlist";
import { computed, nextTick, ref, Ref, watch } from "vue";
import { useRouter } from "vue-router";
import Breadcrumbs from "./Breadcrumbs.vue";
import Explorer from "./layout/Explorer.vue";

const props = defineProps<{path:string}>();

const router = useRouter();
const playlist = usePlaylistStore();

const items: Ref<BrowserEntry[]> = ref([]);
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

const header = computed((): string =>{
	return getPathTail(props.path) || "All Music";
});

function onItemClicked(item: BrowserEntry) {
	if (item.is_directory) {
		router.push("/browse/" + item.path).catch(err => { });
	} else {
		// TODO fix me!!
		// playlist.queueTracks([{ ...item }]);
	}
}

function onItemsDragStart(event: DragEvent, items: BrowserEntry[]) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}

function onQueueAll() {
	playlist.queueDirectory(props.path);
}
</script>
