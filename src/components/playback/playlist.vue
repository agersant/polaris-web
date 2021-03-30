<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>{{ playlist.name || "Playlist" }}</h2>
			<div class="playlistDetails">
				<span class="noselect save" v-on:click="onClickSave">
					<i class="material-icons md-18">save</i>
					<playlist-save v-if="saving" v-bind:tracks="playlist.tracks" v-bind:initialName="playlist.name" v-on:cancel="endSave" v-on:complete="endSave" />
				</span>
				<span data-cy="clear-playlist" class="noselect delete" v-on:click="onClickClear">
					<i class="material-icons md-18">delete</i>
				</span>
				<span data-cy="shuffle-playlist" class="noselect shuffle" v-on:click="onClickShuffle">
					<i class="material-icons md-18">shuffle</i>
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
				<div data-cy="playlist-duration" class="totalDuration" v-if="duration > 0" v-bind:style="{ right: scrollbarWidth + 'px' }">{{ formatPlaylistDuration(duration) }}</div>
			</div>
		</div>

		<div data-cy="playlist" class="paneContent" ref="scrollElement" v-on:scroll="onScroll" v-on:dragover="onDragOver" v-on:drop.prevent="onDrop">
			<div v-bind:style="{ height: topPadding + 'px' }"></div>
			<table>
				<tbody>
					<tr data-cy="track" v-for="(track, index) in visibleTracks" v-bind:key="index" v-bind:class="{ nowPlaying: track == playlist.currentTrack }" v-on:click="onClickTrack(track)">
						<td data-cy="remove" class="remove">
							<div class="remove noselect" v-on:click.stop="onClickRemoveTrack(track)">[-]</div>
						</td>
						<td class="nowPlaying">
							<i data-cy="now-playing" v-if="track == playlist.currentTrack" class="nowPlaying material-icons md-16">play_arrow</i>
						</td>
						<td class="text">{{ formatTrackContext(track) }}</td>
						<td class="text song">
							{{ formatTrackDetails(track) }}
							<span class="trackArtist" v-if="track.album_artist && track.artist && track.album_artist != track.artist">({{ track.artist }})</span>
						</td>
						<td class="text duration">{{ formatTrackDuration(track) }}</td>
					</tr>
				</tbody>
			</table>
			<div v-bind:style="{ height: bottomPadding + 'px' }"></div>
			<div class="help" v-if="playlist.tracks.length == 0">
				<i class="material-icons md-48">queue</i>
				<br />Make a playlist by dragging music from your collection to here.
			</div>
		</div>
	</div>
</template>

<script>
import { nextTick } from "vue";
import { mapState } from "vuex";
import * as Format from "/src/format";
import PlaylistSave from "./playlist-save";
export default {
	components: {
		"playlist-save": PlaylistSave,
	},

	data() {
		return {
			trackHeight: 30, // Also defined in CSS
			maxVisibleTracks: 0,
			numScrolledTracks: 0,
			scrollbarWidth: 0,
			saving: false,
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
			},
		},
		firstRenderedIndex: function() {
			return 2 * Math.floor(this.numScrolledTracks / 2); // Preserve odd/even row indices
		},
		visibleTracks: function () {
			return this.playlist.tracks.slice(this.firstRenderedIndex, this.firstRenderedIndex + this.maxVisibleTracks);
		},
		topPadding: function () {
			return this.firstRenderedIndex * this.trackHeight;
		},
		bottomPadding: function () {
			return Math.max(0, (this.playlist.tracks.length - this.visibleTracks.length) * this.trackHeight - this.topPadding);
		},
		duration: function () {
			return this.playlist.tracks.reduce((acc, track) => {
				const durationInSeconds = parseInt(track.duration, 10);
				if (!durationInSeconds) {
					return acc;
				}
				return acc + durationInSeconds;
			}, 0);
		},
	},

	updated() {
		nextTick(this.updateScrollbarWidth);
	},

	mounted() {
		window.addEventListener("resize", this.onResize);
		this.$store.subscribe((mutation, state) => {
			if (mutation.type === "playlist/advance") {
				this.snapToCurrentTrack();
			}
		});
		this.onResize();
	},

	unmounted() {
		window.removeEventListener("resize", this.onResize);
	},

	methods: {
		onResize() {
			this.updateMaxVisibleTracks();
			this.updateScrollbarWidth();
		},

		onScroll() {
			this.numScrolledTracks = Math.max(0, Math.floor(this.$refs.scrollElement.scrollTop / this.trackHeight));
		},

		updateMaxVisibleTracks() {
			this.maxVisibleTracks = Math.ceil(this.$refs.scrollElement.clientHeight / this.trackHeight) + 2;
		},

		updateScrollbarWidth() {
			this.scrollbarWidth = this.$refs.scrollElement.offsetWidth - this.$refs.scrollElement.clientWidth;
		},

		snapToCurrentTrack() {
			const currentTrackIndex = this.playlist.tracks.indexOf(this.playlist.currentTrack);
			if (currentTrackIndex < 0) {
				return;
			}
			this.$refs.scrollElement.scrollTop = (currentTrackIndex - 10) * this.trackHeight;
		},

		endSave() {
			this.saving = false;
		},

		onDragOver(event) {
			event.preventDefault();
			return false;
		},

		onDrop(event) {
			let items = event.dataTransfer.getData("text/json");
			items = JSON.parse(items);
			for (const item of items) {
				const variant = item.variant;
				if (variant == "Song") {
					this.$store.dispatch("playlist/queueTracks", [item.fields]);
				} else if (variant == "Directory") {
					this.$store.dispatch("playlist/queueDirectory", item.fields.path);
				} else if (variant == "Playlist") {
					this.$store.dispatch("playlist/queuePlaylist", item.fields.name);
				}
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

		onClickShuffle() {
			this.$store.dispatch("playlist/shuffle");
			this.snapToCurrentTrack();
		},

		onClickRemoveTrack(track) {
			this.$store.dispatch("playlist/removeTrack", track);
		},

		formatTrackContext(track) {
			let context = "";
			if (track.album_artist || track.artist) {
				context += track.album_artist || track.artist;
			} else {
				context += "Unknown Artist";
			}
			context += " - ";
			context += track.album ? track.album : "Unknown Album";
			if (track.year) {
				context += " (" + track.year + ")";
			}
			return context;
		},

		formatTrackDetails(track) {
			let details = "";
			if (track.track_number) {
				details += track.track_number;
				details += ". ";
			}
			details += Format.title(track);
			return details;
		},

		formatTrackDuration(track) {
			let durationInSeconds = parseInt(track.duration, 10);
			return Format.duration(durationInSeconds);
		},

		formatPlaylistDuration(durationInSeconds) {
			return Format.longDuration(durationInSeconds);
		},
	},
};
</script>

<style scoped>
.paneHeader {
	overflow: visible !important;
	padding-right: 30px;
}

.paneContent {
	padding: 0 !important;
	overflow-anchor: none;
}

.playlistDetails {
	display: flex;
	min-height: 0;
}

.playlistDetails .save,
.playlistDetails .delete,
.playlistDetails .shuffle {
	cursor: pointer;
	padding-right: 8px;
}

.playlistDetails .shuffle {
	padding-left: 8px;
	border-left: 1px solid var(--theme-border-muted);
}

.playlistDetails span.playbackOrder {
	color: var(--theme-foreground-muted);
	font-size: 0.875rem;
	align-self: center;
}

.playlistDetails .totalDuration {
	flex-grow: 1;
	text-align: right;
	color: var(--theme-foreground);
	font-size: 0.875rem;
	align-self: flex-start;
	position: relative; /*for dynamic offsetting compensating scrollbar*/
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

.help {
	margin-top: 50px;
}
</style>
