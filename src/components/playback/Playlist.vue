<template>

	<div class="flex flex-col border-l pt-8 bg-ls-0 dark:bg-ds-900">

		<div class="m-6 flex items-center justify-between">
			<div class="flex items-center gap-1">
				<span class="-mt-0.5 mr-2 text-2xl font-light text-ls-500 italic dark:text-ds-300">
					{{ playlist.name || "New Playlist" }}
				</span>
				<Button label="Save" text severity="secondary" icon="save" />
				<Button label="Clear" text severity="secondary" icon="clear" />
			</div>
			<div class="flex items-center gap-4">
				<Button label="Shuffle" text severity="secondary" size="lg" icon="shuffle" />
				<!-- TODO playback order -->
				<!-- <Select placeholder="Repeat All" /> -->
			</div>
		</div>

		<OrderableList class="" :items="playlist.entries" :item-height="itemHeight" @reorder="onReorder">
		</OrderableList>

	</div>

</template>

<script setup lang="ts">

import { Song } from '@/api/dto';
import Button from "@/components/basic/Button.vue"
import OrderableList from '@/components/basic/OrderableList.vue';
import { formatArtists, formatDuration, formatTitle } from '@/format';
import { usePlaylistStore, PlaylistEntry } from '@/stores/playlist';

const playlist = usePlaylistStore();

const itemHeight = 32;

function onReorder(tracks: PlaylistEntry[], newIndex: number) {
	playlist.reorder(tracks, newIndex);
}

function formatTrackContext(song: Song) {
	let context = "";
	if (song.album_artists) {
		context += formatArtists(song.album_artists);
	} else if (song.artists) {
		context += formatArtists(song.artists);
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
		return "??:??";
	}
	return formatDuration(song.duration);
}
</script>
