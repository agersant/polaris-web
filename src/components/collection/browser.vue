<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Music Collection</h2>
			<breadcrumbs></breadcrumbs>
		</div>

		<div data-cy="browser" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div data-cy="browser-header" class="header">{{ header }}</div>
				<div v-if="subHeader" class="subHeader">{{ subHeader }}</div>
				<button v-if="items.length > 0" v-on:click="onQueueAll" class="small">Queue All</button>
			</div>
			<explorer v-if="viewMode == 'explorer'" v-bind:items="items" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></explorer>
			<discography v-if="viewMode == 'discography'" v-bind:showArtistName="false" v-bind:albums="items" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></discography>
			<album v-if="viewMode == 'album'" v-bind:items="items" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></album>
		</div>
	</div>
</template>

<script>
import { nextTick, ref, watch} from "vue";
import API from "/src/api";
import * as Format from "/src/format";
import Breadcrumbs from "./breadcrumbs";
import Album from "./layout/album";
import Discography from "./layout/discography";
import Explorer from "./layout/explorer";
export default {
	components: {
		breadcrumbs: Breadcrumbs,
		album: Album,
		discography: Discography,
		explorer: Explorer,
	},

	props: {
		path: {
			type: String,
			required: true,
		},
	},

	setup(props) {
		const items = ref([]);
		const paneContent = ref(null);
		const savedPositions = new Map();
		watch(
			() => props.path,
			async (path, oldPath) => {
				if (oldPath) {
					savedPositions.set(oldPath, paneContent.value.scrollTop);
				}
				items.value = await API.browse(path);
				for (const savedPath of savedPositions.keys()) {
					if (!path.startsWith(savedPath)) {
						savedPositions.delete(savedPath);
					}
				}
				nextTick(() => {
					paneContent.value.scrollTop = savedPositions.get(path) || 0;
				});
			},
			{immediate: true, flush: "post"}
		);

		return {items, paneContent};
	},

	computed: {
		header() {
			let header = "";
			for (let item of this.items) {
				if (item.variant == "Song") {
					if (header && item.fields.album && header != item.fields.album) {
						header = null;
						break;
					} else {
						header = header || item.fields.album;
					}
				}
			}
			return header || Format.getPathTail(this.path) || "All Music";
		},

		subHeader() {
			let subHeader = "";
			for (let item of this.items) {
				if (item.variant == "Song") {
					subHeader = subHeader || item.fields.album_artist || item.fields.artist;
				}
			}
			return subHeader;
		},

		viewMode() {
			let onlySongs = true;
			let onlyDirectories = true;
			let allSameAlbum = true;
			let allHaveAlbums = true;
			let hasAnyPicture = false;
			let album = null;

			for (let item of this.items) {
				if (!item.fields.album) {
					allHaveAlbums = false;
				} else if (!album) {
					album = item.fields.album;
				}
				if (item.fields.artwork) {
					hasAnyPicture = true;
				}
				if (item.variant == "Song") {
					onlyDirectories = false;
					allSameAlbum = allSameAlbum && item.fields.album == album;
				} else {
					onlySongs = false;
				}
			}

			if (onlySongs && hasAnyPicture && allSameAlbum && this.items.length > 0) {
				return "album";
			}
			if (onlyDirectories && hasAnyPicture && allHaveAlbums) {
				return "discography";
			}
			return "explorer";
		},
	},

	methods: {

		onItemClicked(item) {
			const variant = item.variant;
			if (variant == "Directory") {
				this.$router.push("/browse/" + item.fields.path).catch(err => {});
			} else if (variant == "Song") {
				this.$store.dispatch("playlist/queueTracks", [{...item.fields}]);
			}
		},

		onItemsDragStart(event, items) {
			event.dataTransfer.setData("text/json", JSON.stringify(items));
		},

		onQueueAll() {
			if (this.viewMode == "album") {
				const tracks = this.items.map(i => {
					return {...i.fields};
				});
				this.$store.dispatch("playlist/queueTracks", tracks);
			} else {
				this.$store.dispatch("playlist/queueDirectory", this.path);
			}
		},
	},
};
</script>
