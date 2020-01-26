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
				<!--<button if={ tab == "playlist" && items.length > 0 } onclick={ onQueuePlaylist } class="small">
					Play
				</button>
				<button if={ tab == "playlist" } onclick={ onDeletePlaylist } class="danger small" >
					Delete
				</button>-->
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
				v-bind:discs="items"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
				v-on:currentPathDragStart="onCurrentPathDragStart"
			></album>
		</div>
	</div>
</template>

<script>
import * as Utils from "/src/utils";
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
			items: [],
			header: "",
			subHeader: "",
			viewMode: "" // explorer/discography/album
		};
	},

	mounted() {
		this.reset();
		this.browse();
	},

	watch: {
		$route(to, from) {
			this.browse();
		}
	},

	methods: {
		reset() {
			this.items = [];
			this.header = "";
			this.subHeader = "";
			this.viewMode = "explorer";
		},

		browse() {
			if (this.path) {
				// TODO
				// this.savedPositions.set(this.path, this.refs.paneContent.scrollTop);
			}

			var path = this.$route.params.pathMatch || "";
			if (path.startsWith("/")) {
				path = path.substring(1);
			}
			path = decodeURIComponent(path);

			Utils.api("/browse/" + encodeURIComponent(path))
				.then(res => res.json())
				.then(data => {
					this.reset();
					this.path = path;
					for (var i = 0; i < data.length; i++) {
						data[i].fields = data[i].Directory || data[i].Song;
						data[i].variant = data[i].Directory ? "Directory" : "Song";
					}
					this.tab = "browse";
					this.displayItems(data);
					//this.cleanSavedPositions(); TODO
					// this.refs.paneContent.scrollTop = this.savedPositions.get(path) || 0; TODO
				});
		},

		getViewMode(items) {
			var onlySongs = true;
			var onlyDirectories = true;
			var allSameAlbum = true;
			var allHaveAlbums = true;
			var hasAnyPicture = false;
			var album = null;

			for (var i = 0; i < items.length; i++) {
				var item = items[i];
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
					item.fields.url = "api/serve/" + encodeURIComponent(item.fields.path);
					this.header = this.header || item.fields.album;
					this.subHeader = this.subHeader || item.fields.album_artist || item.fields.artist;
					allSameAlbum = allSameAlbum && item.fields.album == album;
				} else {
					onlySongs = false;
					var slices = item.fields.path.replace(/\\/g, "/").split("/");
					slices = slices.filter(function(s) {
						return s.length > 0;
					});
					item.fields.name = slices[slices.length - 1];
				}
			}

			this.header = this.header || Utils.getPathTail(this.path) || "All Music";

			if (onlySongs && hasAnyPicture && allSameAlbum && items.length > 0) {
				return "album";
			}
			if (onlyDirectories && hasAnyPicture && allHaveAlbums) {
				return "discography";
			}

			return "explorer";
		},

		// TODO move into album
		splitAlbumByDisc(items) {
			var discs = [];
			for (var i = 0; i < items.length; i++) {
				var discNumber = items[i].fields.disc_number || 1;
				var disc = discs.find(function(d) {
					return d.discNumber == discNumber;
				});
				if (disc == undefined) {
					disc = {
						discNumber: discNumber,
						songs: []
					};
					discs.push(disc);
				}
				disc.songs.push(items[i]);
			}
			for (var i = 0; i < discs.length; i++) {
				discs[i].songs.sort(function(a, b) {
					return (a.fields.track_number || 0) - (b.fields.track_number || 0);
				});
			}
			discs.sort(function(a, b) {
				return a.discNumber - b.discNumber;
			});
			return discs;
		},

		displayItems(items) {
			this.viewMode = this.getViewMode(items);
			if (this.viewMode == "album") {
				this.items = this.splitAlbumByDisc(items);
			} else {
				this.items = items;
			}
		},

		onItemClicked(item) {
			var variant = item.variant;
			if (variant == "Directory") {
				this.$router.push("/browse/" + item.fields.path).catch(err => {});
			} else if (variant == "Song") {
				this.$store.commit("playlist/queueTracks", [item.fields]);
			}
		},

		onQueueAll() {
			if (this.tab != "search") {
				this.$store.dispatch("playlist/queueDirectory", this.path);
			} else {
				// TODO
				var songItems = [];
				var directoryItems = [];
				this.items.forEach(item => {
					if (item.variant == "Song") {
						songItems.push(item);
					} else if (item.variant == "Directory") {
						directoryItems.push(item);
					}
				});
				eventBus.trigger(
					"browser:queueTracks",
					songItems.map(i => i.fields)
				);
				directoryItems.forEach(item => {
					eventBus.trigger("browser:queueDirectory", item.fields.path);
				});
			}
		},

		onItemDragStart(event, item) {
			event.dataTransfer.setData("text/json", JSON.stringify(item));
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
/*
	cleanSavedPositions() {
		for (const path of self.savedPositions.keys()) {
			if (!self.path.startsWith(path)) {
				self.savedPositions.delete(path);
			}
		}
	}

	function playlist() {
		var matchPath = /^.*#playlist\/?(.*)$/;
		var matches = window.location.href.match(matchPath);
		var playlistName = matches ? matches[1] : "";
		playlistName = decodeURIComponent(playlistName);

		utils.api("/playlist/" + encodeURIComponent(playlistName))
		.then(res => res.json())
		.then(function(data) {
			this.reset();
			for (var i = 0; i < data.length; i++) {
				var fields = data[i];
				data[i] = { fields: fields, variant: "Song" };
			}
			this.tab = "playlist";
			this.title = "Playlists";
			this.playlistName = playlistName;
			this.header = playlistName;
			this.displayItems(data);
		}.bind(self));
	}

	function search() {
		var matchPath = /^.*#search\/?(.*)$/;
		var matches = window.location.href.match(matchPath);
		var query = matches ? matches[1] : "";
		query = decodeURIComponent(query);

		utils.api("/search/" + encodeURIComponent(query))
		.then(res => res.json())
		.then(function(data) {
			this.reset();
			for (var i = 0; i < data.length; i++) {
				data[i].fields = data[i].Directory || data[i].Song;
				data[i].variant = data[i].Directory ? "Directory" : "Song";
			}
			this.tab = "search";
			this.title = "Search";
			if (data.length == 0) {
				this.header = "No results found";
			} else if (data.length == 1) {
				this.header = "1 result found";
			} else {
				this.header = data.length + " results found";
			}
			this.displayItems(data);
		}.bind(self));
	}

	onQueuePlaylist(e) {
		eventBus.trigger("browser:queuePlaylist", this.playlistName, this.items.map(i => i.fields ));
	}

	onDragAlbumStart(e) {
		var directoryItem = {
			variant: "Directory",
			fields: {
				path: this.path,
			},
		};
		e.dataTransfer.setData("text/json", JSON.stringify(directoryItem));
	}

	onDeletePlaylist(e) {
		utils.api("/playlist/" + encodeURIComponent(this.playlistName), { method: "DELETE" })
		.then(res => {
			route("playlists/");
		});
	}
	*/
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

.paneContent {
	padding-top: 50px;
}

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
