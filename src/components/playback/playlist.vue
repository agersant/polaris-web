<template>
	<div class="playlist">
		<div class="paneHeader">
			<h2>{{ playlist.name || "Playlist" }}</h2>
			<div class="playlistOperations">
				<span class="noselect save" v-on:click="onClickSave">
					<i class="material-icons md-18">save</i>
					<playlist-save
						v-if="saving"
						v-bind:tracks="playlist.tracks"
						v-bind:initialName="playlist.name"
						v-on:cancel="endSave"
						v-on:complete="endSave"
					/>
				</span>
				<span data-cy="clear-playlist" class="noselect delete" v-on:click="onClickClear">
					<i class="material-icons md-18">delete</i>
				</span>
				<span class="playbackOrder">
					Order:
					<select v-model="playbackOrder">
						<option value="default">Default</option>
						<option value="random">Random</option>
						<option value="repeat-track">Repeat Track</option>
						<option value="repeat-all">Repeat All</option>
					</select>
				</span>
			</div>
		</div>

		<div
			data-cy="playlist"
			class="paneContent"
			ref="scrollElement"
			v-on:scroll="onScroll"
			v-on:dragover="onDragOver"
			v-on:drop.prevent="onDrop"
		>
			<div v-bind:style="{height: topPadding + 'px'}"></div>
			<table>
				<tbody>
					<tr
						data-cy="track"
						v-for="(track, index) in visibleTracks"
						v-bind:key="index"
						v-bind:class="{ nowPlaying: track == playlist.currentTrack }"
						v-on:click="onClickTrack(track)"
					>
						<td data-cy="remove" class="remove">
							<div class="remove noselect" v-on:click="onClickRemoveTrack(track)">[-]</div>
						</td>
						<td class="nowPlaying">
							<i
								data-cy="now-playing"
								v-if="track == playlist.currentTrack"
								class="nowPlaying material-icons md-16"
							>play_arrow</i>
						</td>
						<td class="text">{{ formatTrackContext(track) }}</td>
						<td class="text song">
							{{ formatTrackDetails(track) }}
							<span
								class="trackArtist"
								v-if="track.info.album_artist && track.info.artist && track.info.album_artist != track.info.artist"
							>({{ track.info.artist }})</span>
						</td>
						<td class="text duration">{{ formatTrackDuration(track) }}</td>
					</tr>
				</tbody>
			</table>
			<div v-bind:style="{height: bottomPadding + 'px'}"></div>
			<div class="help" v-if="playlist.tracks.length == 0">
				<i class="material-icons md-48">queue</i>
				<br />Make a playlist by dragging music from your collection to here.
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";
import * as Utils from "/src/utils";
import PlaylistSave from "./playlist-save";
export default {
	components: {
		"playlist-save": PlaylistSave
	},

	data() {
		return {
			itemHeight: 30, // Also defined in CSS
			pageSize: 50,
			pagePadding: 6,
			scrollOffset: 0,
			saving: false
		};
	},

	computed: {
		...mapState(["playlist"]),
		playbackOrder: {
			set(order) {
				this.$store.dispatch("playlist/setPlaybackOrder", order);
			},
			get() {
				return this.playlist.playbackOrder;
			}
		},
		visibleTracks: function() {
			return this.playlist.tracks.slice(this.scrollOffset, this.scrollOffset + this.pageSize);
		},
		topPadding: function() {
			return this.scrollOffset * this.itemHeight;
		},
		bottomPadding: function() {
			return Math.max(0, (this.playlist.tracks.length - this.scrollOffset - this.pageSize) * this.itemHeight);
		}
	},

	mounted() {
		this.$store.subscribe((mutation, state) => {
			if (mutation.type === "playlist/advance") {
				this.snapToCurrentTrack();
			}
		});
	},

	methods: {
		onScroll() {
			let newOffset = Math.max(0, Math.floor(this.$refs.scrollElement.scrollTop / this.itemHeight) - this.pagePadding);
			newOffset = 2 * Math.floor(newOffset / 2); // Preserve odd/even row indices
			if (newOffset == this.scrollOffset) {
				return;
			}
			this.scrollOffset = newOffset;
		},

		snapToCurrentTrack() {
			const currentTrackIndex = this.playlist.tracks.indexOf(this.playlist.currentTrack);
			if (currentTrackIndex < 0) {
				return;
			}
			this.$refs.scrollElement.scrollTop = (currentTrackIndex - 10) * this.itemHeight;
		},

		endSave() {
			this.saving = false;
		},

		onDragOver(event) {
			event.preventDefault();
			return false;
		},

		onDrop(event) {
			var item = event.dataTransfer.getData("text/json");
			item = JSON.parse(item);
			var variant = item.variant;
			if (variant == "Song") {
				this.$store.dispatch("playlist/queueTracks", [item.fields]);
			} else if (variant == "Directory") {
				this.$store.dispatch("playlist/queueDirectory", item.fields.path);
			} else if (variant == "Playlist") {
				// TODO
				this.queuePlaylist(item.fields.name);
			}
		},

		onClickTrack(track) {
			this.$store.dispatch("playlist/play", track);
		},

		onClickSave() {
			this.saving = true;
		},

		onClickClear() {
			this.$store.dispatch("playlist/clear");
		},

		onClickRemoveTrack(track) {
			this.$store.dispatch("playlist/removeTrack", track);
		},

		formatTrackContext(track) {
			let context = "";
			if (track.info.album_artist || track.info.artist) {
				context += track.info.album_artist || track.info.artist;
			} else {
				context += "Unknown Artist";
			}
			context += " - ";
			context += track.info.album ? track.info.album : "Unknown Album";
			if (track.info.year) {
				context += " (" + track.info.year + ")";
			}
			return context;
		},

		formatTrackDetails(track) {
			let details = "";
			if (track.info.track_number) {
				details += track.info.track_number;
				details += ". ";
			}
			if (track.info.title) {
				details += track.info.title;
			} else {
				details += Utils.stripFileExtension(Utils.getPathTail(track.info.path));
			}
			return details;
		},

		formatTrackDuration(track) {
			let durationInSeconds = parseInt(track.info.duration, 10);
			if (isNaN(durationInSeconds)) {
				return "";
			}
			let date = new Date(null);
			date.setSeconds(durationInSeconds);
			let formatted = date.toISOString().substr(11, 8);
			formatted = formatted.replace(/^[0:]{1,4}/, "");
			return formatted;
		}
	}
};
/*
	queuePlaylist(name, tracks) {
		this.clear();
		this.playlistName = name;
		if (tracks) {
			this.queueTracks(tracks);
		} else {
			this.queueURL('/playlist/' + encodeURIComponent(name));
		}
	}
*/
</script>

<style scoped>
.paneHeader {
	overflow: visible !important;
}

.paneContent {
	padding-left: 0 !important;
	padding-right: 0 !important;
	overflow-anchor: none;
}

.playlistOperations {
	display: flex;
	flex-grow: 1;
	flex-shrink: 1;
	min-height: 0;
}

.playlistOperations .save,
.playlistOperations .delete {
	cursor: pointer;
	padding-right: 8px;
}

.playlistOperations span.playbackOrder {
	color: var(--theme-foreground-muted);
	font-size: 0.875rem;
	align-self: center;
}

tr:not(:hover) .remove {
	color: transparent;
}

.remove {
	cursor: pointer;
}

table {
	width: 100%;
	border-spacing: 0;
}

tr {
	height: 30px; /*Used in JS*/
	cursor: default;
	white-space: nowrap;
}

tr:nth-child(2n) {
	background-color: var(--theme-background-muted);
}

td {
	padding-bottom: 3px;
	vertical-align: bottom;
	font-size: 0.8125rem;
}

.remove,
td.nowPlaying {
	width: 25px;
	text-align: center;
}

td.text {
	max-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding-right: 30px;
}

td.song .trackArtist {
	color: var(--theme-foreground-muted);
}

td.duration {
	text-align: right;
}

tr.nowPlaying td.song .trackArtist {
	color: var(--theme-foreground-against-accent);
	opacity: 0.65;
}

tr.nowPlaying td,
tr.nowPlaying td * {
	color: var(--theme-foreground-against-accent);
	font-weight: 600;
	background-color: var(--theme-accent);
}

.material-icons.nowPlaying {
	vertical-align: middle;
	padding-bottom: 2px;
}
</style>
