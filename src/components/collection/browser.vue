<template>
	<div class="browser">
		<div class="paneHeader">
			<h2>Music Collection</h2>
			<breadcrumbs></breadcrumbs>
		</div>

		<div class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ header }}</div>
				<div v-if="subHeader" class="subHeader">{{ subHeader }}</div>
				<button v-if="items.length > 0" v-on:click="onQueueAll" class="small">Queue All</button>
			</div>
			<explorer
				v-if="viewMode == 'explorer'"
				v-bind:items="items"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
			></explorer>
			<discography
				v-if="viewMode == 'discography'"
				v-bind:showArtistName="false"
				v-bind:albums="items"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
			></discography>
			<album
				v-if="viewMode == 'album'"
				v-bind:items="items"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
				v-on:currentPathDragStart="onCurrentPathDragStart"
			></album>
		</div>
	</div>
</template>

<script>
import Vue from "vue";
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
		explorer: Explorer
	},

	data() {
		return {
			items: []
		};
	},

	mounted() {
		this.savedPositions = new Map();
		this.path = null;
		this.browse();
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
		}
	},

	watch: {
		$route(to, from) {
			this.browse();
		}
	},

	methods: {
		browse() {
			if (this.path) {
				this.savedPositions.set(this.path, this.$refs.paneContent.scrollTop);
			}

			let newPath = this.$route.params.pathMatch || "";
			if (newPath.startsWith("/")) {
				newPath = newPath.substring(1);
			}

			API.browse(newPath).then(items => {
				this.path = newPath;
				this.tab = "browse";
				this.items = items;
				this.cleanSavedPositions();
				Vue.nextTick(() => {
					this.$refs.paneContent.scrollTop = this.savedPositions.get(newPath) || 0;
				});
			});
		},

		cleanSavedPositions() {
			for (const path of this.savedPositions.keys()) {
				if (!this.path.startsWith(path)) {
					this.savedPositions.delete(path);
				}
			}
		},

		onItemClicked(item) {
			const variant = item.variant;
			if (variant == "Directory") {
				this.$router.push("/browse/" + item.fields.path).catch(err => {});
			} else if (variant == "Song") {
				this.$store.dispatch("playlist/queueTracks", [item.fields]);
			}
		},

		onItemDragStart(event, item) {
			event.dataTransfer.setData("text/json", JSON.stringify(item));
		},

		onQueueAll() {
			this.$store.dispatch("playlist/queueDirectory", this.path);
		},

		onCurrentPathDragStart(event) {
			let directoryItem = {
				variant: "Directory",
				fields: {
					path: this.path
				}
			};
			event.dataTransfer.setData("text/json", JSON.stringify(directoryItem));
		}
	}
};
</script>

<style scoped>
.viewActions {
	margin-bottom: 40px;
	font-size: 0;
}

.viewActions .header {
	line-height: 1;
	margin-bottom: 5px;
	font-size: 1.25rem;
	font-family: "Montserrat", "sans-serif";
}

.viewActions .subHeader {
	line-height: 1;
	font-size: 1.25rem;
	margin-bottom: 5px;
	color: var(--theme-foreground-muted);
}

.viewActions button {
	display: inline;
}
</style>
