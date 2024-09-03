<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Album</h2>
		</div>

		<div class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ header }}</div>
				<button v-if="album?.songs.length" v-on:click="onQueueAll" class="small">Queue All</button>
			</div>
			<Album v-bind:songs="album?.songs || []" v-on:item-click="onItemClicked"
				v-bind:on-items-drag-start="onItemsDragStart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watch } from "vue";
import { Album as AlbumDTO, AlbumKey, Song } from "@/api/dto";
import { get_album } from "@/api/endpoints";
import { usePlaybackStore } from "@/stores/playback";
import Album from "./layout/Album.vue";

const props = defineProps<{ album_key: AlbumKey }>();

const playback = usePlaybackStore();

const album: Ref<AlbumDTO | null> = ref(null);
const paneContent: Ref<HTMLElement | null> = ref(null);

watch(
	() => props.album_key,
	async (album_key) => {
		album.value = await get_album(album_key);
	},
	{ immediate: true }
);

const header = computed((): string => {
	return props.album_key.name || "Unknown Album";
});

function onItemClicked(song: Song) {
	playback.queueTracks([{ ...song }]);
}

function onItemsDragStart(event: DragEvent, items: Song[]) {
	// TODO not getting called somehow
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}

function onQueueAll() {
	playback.queueTracks((album.value?.songs || []).map(s => { return { ...s } }));
}
</script>
