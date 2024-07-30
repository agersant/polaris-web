<template>
	<ul class="explorerView">
		<li draggable="true" v-for="(item, index) in props.items" v-bind:key="index"
			v-on:click="emits('item-click', item)" v-on:dragstart="event => emits('items-drag-start', event, [item])">
			<div data-cy="explorer-directory" v-if="item.is_directory" class="directory">
				<i class="material-icons">folder</i>
				{{ formatItem(item) }}
			</div>
			<div data-cy="explorer-song" v-if="!item.is_directory" class="song">{{ formatItem(item) }}</div>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { BrowserEntry } from "@/api/dto";

const props = defineProps<{
	items: BrowserEntry[],
}>();

const emits = defineEmits<{
	(event:'item-click', item: BrowserEntry): void
	(event:'items-drag-start', dragEvent: DragEvent, items: BrowserEntry[]): void
}>();

function formatItem(item: BrowserEntry) {
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