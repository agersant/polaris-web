<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Recently Added</h2>
		</div>
		<div class="paneContent" ref="paneContent">
			<Discography v-bind:showArtistName="true" v-bind:albums="items" v-on:item-click="onItemClicked"
				v-on:items-drag-start="onItemsDragStart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { AlbumHeader } from "@/api/dto";
import { recent } from "@/api/endpoints";
import Discography from "./layout/Discography.vue";
import { URI_ARRAY_SEPARATOR } from "@/router";

const router = useRouter();

const items: Ref<AlbumHeader[]> = ref([]);

onMounted(() => {
	refresh();
});

async function refresh() {
	items.value = [];
	items.value = await recent();
}

function onItemClicked(item: AlbumHeader) {
	// TODO most likely breaks when artists or album name contain `/` character
	router.push("/albums/" + (item.artists || []).join(URI_ARRAY_SEPARATOR) + "/" + (item.name || "")).catch(err => { });
}

function onItemsDragStart(event: DragEvent, items: AlbumHeader[]) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}
</script>

<style scoped>
.more {
	cursor: pointer;
	height: 20px;
}

.more span {
	padding-left: 4px;
	font-size: 0.875rem;
	vertical-align: top;
}
</style>
