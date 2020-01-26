<template>
	<div class="playlist">
		<div class="paneHeader">
			<h2>{{ playlist.name || "Playlist" }}</h2>
			<div class="playlistOperations">
				<span class="noselect save" v-on:click="onClickSave">
					<i class="material-icons md-18">save</i>
					<!-- <playlist-save v-if="saving" v-bind:tracks="tracks" v-bind:name="playlist.Name" /> -->
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
export default {
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
				this.$store.commit("playlist/setPlaybackOrder", order);
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

	methods: {
		onScroll() {
			let newOffset = Math.max(0, Math.floor(this.$refs.scrollElement.scrollTop / this.itemHeight) - this.pagePadding);
			newOffset = 2 * Math.floor(newOffset / 2); // Preserve odd/even row indices
			if (newOffset == this.scrollOffset) {
				return;
			}
			this.scrollOffset = newOffset;
		},

		playTrack(track) {
			this.$store.commit("playlist/play", track);
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
				this.$store.commit("playlist/queueTracks", [item.fields]);
			} else if (variant == "Directory") {
				this.$store.dispatch("playlist/queueDirectory", item.fields.path);
			} else if (variant == "Playlist") {
				// TODO
				this.queuePlaylist(item.fields.name);
			}
		},

		onClickTrack(track) {
			this.playTrack(track);
		},

		onClickSave() {
			this.saving = true;
		},

		onClickClear() {
			this.$store.commit("playlist/clear");
		},

		onClickRemoveTrack(track) {
			this.$store.commit("playlist/removeTrack", track);
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
	this.on('mount', function() {
		this.loadFromDisk();
	});

	loadFromDisk() {
		var playbackOrder = utils.loadUserData("playbackOrder");
		if (playbackOrder) {
			this.refs.playbackOrder.value = playbackOrder;
		}
		var tracks = utils.loadUserData("playlist");
		if (tracks) {
			this.tracks = tracks;
		}
		var currentTrackIndex = utils.loadUserData("currentTrackIndex");
		if (currentTrackIndex && currentTrackIndex >= 0 && currentTrackIndex < this.tracks.length) {
			var newTrack = this.tracks[currentTrackIndex];
			eventBus.trigger("playlist:jumpTo", newTrack);
		}
		this.playlistName = utils.loadUserData("playlistName");
	}

	queuePlaylist(name, tracks) {
		this.clear();
		this.playlistName = name;
		if (tracks) {
			this.queueTracks(tracks);
		} else {
			this.queueURL('/playlist/' + encodeURIComponent(name));
		}
	}

	advance(currentTrack, delta) {
		var playbackOrder = this.refs.playbackOrder.selectedOptions[0].value;
		var numTracks = this.tracks.length;

		var newTrack = null;
		if (numTracks > 0) {
			if (playbackOrder == "random") {
				var newTrackIndex = Math.floor(Math.random() * numTracks);
				newTrack = this.tracks[newTrackIndex];
			} else if (playbackOrder == "repeat-track") {
				newTrack = currentTrack;
			} else {
				var currentTrackIndex = this.tracks.indexOf(currentTrack);
				if (currentTrackIndex < 0) {
					newTrack = this.tracks[0];
				} else {
					var newTrackIndex = currentTrackIndex + delta;
					if (newTrackIndex >= 0 && newTrackIndex < numTracks) {
						newTrack = this.tracks[newTrackIndex];
					} else if (playbackOrder == "repeat-all") {
						if (delta > 0) {
							newTrack = this.tracks[0];
						} else {
							newTrack = this.tracks[this.tracks.length - 1];
						}
					}
				}
			}
		}

		if (newTrack != null) {
			this.playTrack(newTrack);
		}
		this.snapToCurrentTrack();
	}

	playPrevious(currentTrack) {
		return this.advance(currentTrack, -1);
	}

	playNext(currentTrack) {
		return this.advance(currentTrack, 1);
	}

	snapToCurrentTrack() {
		var currentTrackIndex = this.tracks.indexOf(this.currentTrack);
		if (currentTrackIndex < 0) {
			return;
		}
		this.refs.scrollElement.scrollTop = (currentTrackIndex - 10) * this.itemHeight;
	}

	updateCurrentTrack(track) {
		this.currentTrack = track;
		this.saveLocalPlaylist();
		this.update();
	}

	onChangePlaybackOrder(e) {
		var playbackOrder = this.refs.playbackOrder.selectedOptions[0].value;
		utils.saveUserData("playbackOrder", playbackOrder);
	}

	saveLocalPlaylist() {
		if (utils.saveUserData("playlist", this.tracks)) {
			utils.saveUserData("playlistName", this.playlistName);
			var currentTrackIndex = this.tracks.indexOf(this.currentTrack);
			utils.saveUserData("currentTrackIndex", currentTrackIndex);
		}
	}

	endSave(playlistName) {
		this.saving = false;
		this.playlistName = playlistName;
		this.saveLocalPlaylist();
		this.update();
	}

	eventBus.on("player:trackFinished", this.playNext);
	eventBus.on("player:playPrevious", this.playPrevious);
	eventBus.on("player:playNext", this.playNext);
	eventBus.on("player:playing", this.updateCurrentTrack);
	eventBus.on("playlist-save:cancel", this.endSave);
	eventBus.on("playlist-save:done", this.endSave);

	this.clear();
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
playlist .nowPlaying {
	width: 25px;
}

.remove,
playlist td.nowPlaying {
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
