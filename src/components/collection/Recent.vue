<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Recently Added</h2>
		</div>
		<div class="paneContent" ref="paneContent">
			<Discography v-bind:showArtistName="true" v-bind:directories="items" v-on:item-click="onItemClicked"
				v-on:items-drag-start="onItemsDragStart" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { useRouter } from "vue-router";
import { Directory } from "@/api/dto";
import { recent } from "@/api/endpoints";
import Discography from "./layout/Discography.vue";

const router = useRouter();

const items: Ref<Directory[]> = ref([]);

onMounted(() => {
	refresh();
});

async function refresh() {
	items.value = [];
	items.value = await recent();
}

function onItemClicked(item: Directory) {
	router.push("/browse/" + item.path).catch(err => { });
}

function onItemsDragStart(event: DragEvent, items: Directory[]) {
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
