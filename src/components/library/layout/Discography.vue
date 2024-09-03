<template>
	<ul>
		<li data-cy="album" class="album" draggable="true" v-for="(album, index) in props.albums" v-bind:key="index"
			@click="onItemClicked(album)" @dragstart="event => onItemsDragStart(event, album)">
			<div class="cover">
				<CoverArt v-if="album.artwork" v-bind:url="makeThumbnailURL(album.artwork, 'small')" />
			</div>
			<div class="details">
				<div class="title">{{ album.name }}</div>
				<div v-if="showArtistName" class="artist">{{ formatArtists(album.artists || []) }}</div>
				<div class="year">{{ album.year }}</div>
			</div>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { AlbumHeader } from "@/api/dto";
import { formatArtists } from "@/format";
import { makeThumbnailURL } from "@/api/endpoints";
import CoverArt from "/src/components/CoverArt.vue";

const props = defineProps<{
	albums: AlbumHeader[],
	showArtistName: boolean
}>();

const emits = defineEmits<{
	(event: 'item-click', item: AlbumHeader): void
	(event: 'items-drag-start', dragEvent: DragEvent, items: AlbumHeader[]): void
}>();

function onItemClicked(directory: AlbumHeader) {
	emits("item-click", directory);
}

function onItemsDragStart(event: DragEvent, directory: AlbumHeader) {
	emits("items-drag-start", event, [directory]);
}
</script>

<style scoped>
ul {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
}

.album {
	font-size: 0;
	margin-bottom: 20px;
	cursor: default;
	width: 23.5%;
	margin-left: 1%;
	margin-right: 1%;
}

.album:nth-child(4n + 1) {
	margin-left: 0;
}

.album:nth-child(4n) {
	margin-right: 0;
}

.cover {
	width: 100%;
	position: relative;
}

.cover:after {
	/*Hack to make this element stay square when its width changes*/
	content: "";
	display: block;
	padding-bottom: 100%;
}

.details {
	padding: 10px 0;
	width: 100%;
}

.details .title {
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.25;
}

.details .artist {
	margin-bottom: -5px;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	font-size: 0.875rem;
}

.details .year {
	font-size: 0.875rem;
	color: var(--theme-foreground-muted);
}
</style>