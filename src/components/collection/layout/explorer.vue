<template>
	<ul class="explorerView">
		<li draggable="true" v-for="(item, index) in props.items" v-bind:key="index"
			v-on:click="emits('item-click', item)" v-on:dragstart="event => emits('items-drag-start', event, [item])">
			<div data-cy="explorer-directory" v-if="item.variant == 'Directory'" class="directory">
				<i class="material-icons">folder</i>
				{{ formatDirectoryName(item) }}
			</div>
			<div data-cy="explorer-song" v-if="item.variant == 'Song'" class="song">{{ formatTrackDetails(item) }}</div>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { CollectionItem, Directory, Song } from "@/api/dto";
import { formatTitle } from "@/format";

const props = defineProps<{
	items: CollectionItem[],
}>();

const emits = defineEmits<{
	(event:'item-click', item: CollectionItem): void
	(event:'items-drag-start', dragEvent: DragEvent, items: CollectionItem[]): void
}>();

function formatTrackDetails(item: Song) {
	let details = "";
	if (item.artist) {
		details += item.artist;
		details += " - ";
	}
	if (item.track_number) {
		details += item.track_number;
		details += ". ";
	}
	details += formatTitle(item);
	return details;
}

function formatDirectoryName(item: Directory) {
	let slices = item.path.replace(/\\/g, "/").split("/");
	slices = slices.filter(function (s) {
		return s.length > 0;
	});
	return slices[slices.length - 1];
}
</script>

<style scoped>
.explorerView {
	margin-bottom: 50px;
}

.directory .material-icons {
	vertical-align: bottom;
	margin-right: 5px;
	padding-bottom: 3px;
}

.directory,
.song {
	cursor: default;
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>