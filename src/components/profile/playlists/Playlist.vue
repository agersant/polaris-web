<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>
		<div data-cy="saved-playlist-details" v-if="songList" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ name }}</div>
				<button v-if="songList.paths.length > 0" v-on:click="play" class="small">Play</button>
				<button v-on:click="deletePlaylist" class="danger small">Delete</button>
			</div>
			<!-- TODO fixme -->
			<!-- <explorer v-bind:items="tracks" v-on:item-click="onItemClicked" @items-drag-start="onItemsDragStart" /> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { Ref, ref, watchEffect } from "vue";
import Explorer from "@/components/collection/layout/Explorer.vue";
import { usePlaybackStore } from "@/stores/playback";
import { getPlaylist, deletePlaylist as doDeletePlaylist } from "@/api/endpoints";
import { SongList } from "@/api/dto";
import { useRouter } from "vue-router";

const props = defineProps<{
	name: string,
}>();

const router = useRouter();
const playback= usePlaybackStore();

const songList: Ref<SongList | null> = ref(null);

watchEffect(async () => {
	songList.value = null;
	songList.value = await getPlaylist(props.name);
});

function play() {
	playback.queuePlaylist(props.name);
}

async function deletePlaylist() {
	await doDeletePlaylist(props.name);
	router.push("/playlists").catch(err => { });
}

// TODO fixme
// function onItemClicked(item: CollectionItem) {
	// 	if (item.variant == "Song") {
		// 		playback.queueTracks([{ ...item }]);
		// 	}
		// }
		
// TODO fixme
// function onItemsDragStart(event: DragEvent, items: CollectionItem[]) {
// 	if (!event || !event.dataTransfer) {
// 		return;
// 	}
// 	event.dataTransfer.setData("text/json", JSON.stringify(items));
// }
</script>
