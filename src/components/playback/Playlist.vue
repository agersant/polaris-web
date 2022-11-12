<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>{{ playlist.name || "Playlist" }}</h2>
			<div class="playlistDetails">
				<span data-cy="playlist-save" class="noselect save" v-on:click="onClickSave">
					<i class="material-icons md-18">save</i>
					<playlist-save v-if="saving" v-bind:tracks="playlist.songs" v-bind:initialName="playlist.name"
						v-on:cancel="endSave" v-on:complete="endSave" />
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
				<div data-cy="playlist-duration" class="totalDuration" v-if="duration > 0"
					v-bind:style="{ right: scrollbarWidth + 'px' }">{{ formatLongDuration(duration) }}</div>
			</div>
		</div>

		<div data-cy="playlist" class="paneContent" ref="scrollElement" v-on:scroll="onScroll" @dragover.prevent
			v-on:drop.prevent="onDrop">
			<div v-bind:style="{ height: topPadding + 'px' }"></div>
			<table>
				<tbody>
					<tr data-cy="track" v-for="(track, index) in visibleTracks" v-bind:key="index"
						v-bind:class="{ nowPlaying: track == currentTrackRaw }" v-on:click="onClickTrack(track)">
						<td data-cy="remove" class="remove">
							<div class="remove noselect" v-on:click.stop="onClickRemoveTrack(track)">[-]</div>
						</td>
						<td class="nowPlaying">
							<i data-cy="now-playing" v-if="track == currentTrackRaw"
								class="nowPlaying material-icons md-16">play_arrow</i>
						</td>
						<td class="text">{{ formatTrackContext(track) }}</td>
						<td class="text song">
							{{ formatTrackDetails(track) }}
							<span class="trackArtist"
								v-if="track.album_artist && track.artist && track.album_artist != track.artist">({{
								track.artist }})</span>
						</td>
						<td class="text duration">{{ formatTrackDuration(track) }}</td>
					</tr>
				</tbody>
			</table>
			<div v-bind:style="{ height: bottomPadding + 'px' }"></div>
			<div class="help" v-if="playlist.songs.length == 0">
				<i class="material-icons md-48">queue</i>
				<br />Make a playlist by dragging music from your collection to here.
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, onUpdated, Ref, ref, toRaw } from "vue";
import { PlaybackOrder, usePlaylistStore } from "@/stores/playlist";
import PlaylistSave from "./PlaylistSave.vue";
import { CollectionItem, ListPlaylistsEntry, Song } from "@/api/dto";
import { formatDuration, formatLongDuration, formatTitle } from "@/format";

type PlaylistDragAndDropPayload = CollectionItem[] | ListPlaylistsEntry;

const playlist = usePlaylistStore();

const trackHeight = 30; // Also defined in CSS
const maxVisibleTracks = ref(0);
const numScrolledTracks = ref(0);
const scrollbarWidth = ref(0);
const saving = ref(false);
const scrollElement: Ref<HTMLElement | null> = ref(null);

const currentTrackRaw = computed(() => toRaw(playlist.currentTrack));
const playbackOrder = computed({
	set(order: PlaybackOrder) {
		playlist.setPlaybackOrder(order);
	},
	get() {
		return playlist.playbackOrder;
	},
});
const firstRenderedIndex = computed(() => 2 * Math.floor(numScrolledTracks.value / 2)); // Preserves odd/even row indices
const visibleTracks = computed(() => playlist.songs.slice(firstRenderedIndex.value, firstRenderedIndex.value + maxVisibleTracks.value));
const topPadding = computed(() => firstRenderedIndex.value * trackHeight);
const bottomPadding = computed(() => Math.max(0, (playlist.songs.length - visibleTracks.value.length) * trackHeight - topPadding.value));
const duration = computed(() => playlist.songs.reduce((acc, song) => {
	if (!song.duration || isNaN(song.duration)) {
		return acc;
	}
	return acc + song.duration;
}, 0));

playlist.$onAction(({name, after}) => {
	if (name == "shuffle" || name == "next" || name == "previous") {
		after(snapToCurrentTrack);
	}
});

onUpdated(() => {
	nextTick(updateScrollbarWidth);
});

onMounted(() => {
	window.addEventListener("resize", onResize);
	onResize();
});

onUnmounted(() => {
	window.removeEventListener("resize", onResize);
});

function onResize() {
	updateMaxVisibleTracks();
	updateScrollbarWidth();
}

function onScroll() {
	if (!scrollElement.value) {
		return;
	}
	numScrolledTracks.value = Math.max(0, Math.floor(scrollElement.value.scrollTop / trackHeight));
}

function updateMaxVisibleTracks() {
	if (!scrollElement.value) {
		return;
	}
	maxVisibleTracks.value = Math.ceil(scrollElement.value.clientHeight / trackHeight) + 2;
}

function updateScrollbarWidth() {
	if (!scrollElement.value) {
		return;
	}
	scrollbarWidth.value = scrollElement.value.offsetWidth - scrollElement.value.clientWidth;
}

function snapToCurrentTrack() {
	if (!currentTrackRaw.value || !scrollElement.value) {
		return;
	}
	const currentTrackIndex = playlist.songs.indexOf(currentTrackRaw.value);
	if (currentTrackIndex < 0) {
		return;
	}
	scrollElement.value.scrollTop = (currentTrackIndex - 10) * trackHeight;
}

function onClickSave() {
	saving.value = true;
}

function endSave() {
	saving.value = false;
}

function onDrop(event: DragEvent) {
	if (!event || !event.dataTransfer) {
		return;
	}
	const transferData = event.dataTransfer.getData("text/json");
	const payload: PlaylistDragAndDropPayload = JSON.parse(transferData);
	if (Array.isArray(payload)) {
		for (const item of payload) {
			if (item.variant == "Song") {
				playlist.queueTracks([item]);
			} else if (item.variant == "Directory") {
				playlist.queueDirectory(item.path);
			}
		}
	} else {
		playlist.queuePlaylist(payload.name);
	}
}

function onClickTrack(song: Song) {
	playlist.play(song);
}

function onClickClear() {
	playlist.clear();
}

function onClickShuffle() {
	playlist.shuffle();
}

function onClickRemoveTrack(song: Song) {
	playlist.removeTrack(song);
}

function formatTrackContext(song: Song) {
	let context = "";
	if (song.album_artist || song.artist) {
		context += song.album_artist || song.artist;
	} else {
		context += "Unknown Artist";
	}
	context += " - ";
	context += song.album ? song.album : "Unknown Album";
	if (song.year) {
		context += " (" + song.year + ")";
	}
	return context;
}

function formatTrackDetails(song: Song) {
	let details = "";
	if (song.track_number) {
		details += song.track_number;
		details += ". ";
	}
	details += formatTitle(song);
	return details;
}

function formatTrackDuration(song: Song) {
	if (!song.duration || isNaN(song.duration)) {
		return "";
	}
	return formatDuration(song.duration);
}
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
	position: relative;
	/*for dynamic offsetting compensating scrollbar*/
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
	height: 30px;
	/*Used in JS*/
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
