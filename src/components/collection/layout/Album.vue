<template>
	<div class="details">
		<div class="coverArt">
			<img v-bind:src="artworkURL" draggable="true"
				v-on:dragstart="event => $emit('items-drag-start', event, songs)" />
		</div>
		<div class="trackList">
			<ul>
				<li v-for="(disc, index) in discs" v-bind:key="index">
					<div draggable="true" class="discNumber" v-if="discs.length > 1"
						v-on:dragstart="event => onDiscDragStart(event, disc)">
						Disc {{ disc.number || '?' }}
					</div>
					<ol class="discContent">
						<li draggable="true" v-bind:value="item.track_number?.toString()"
							v-bind:class="{ song: 1, 'no-track-number': !item.track_number }"
							v-for="(item, index) in disc.songs" v-bind:key="index"
							v-on:click="$emit('item-click', item)"
							v-on:dragstart="event => $emit('items-drag-start', event, [item])">
							<span class="songName">
								{{ formatTitle(item) }}
								<span class="trackArtist"
									v-if="item.artist && item.album_artist && item.artist != item.album_artist">({{
									item.artist }})</span>
							</span>
						</li>
					</ol>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { formatTitle } from "@/format"
import { makeThumbnailURL } from "@/api/endpoints"
import { Song } from "@/api/dto"

type Disc = {
	number: number | null,
	songs: Song[],
}

const props = defineProps<{
	songs: Song[],
}>();

const emits = defineEmits<{
	(event:'item-click', item: Song): void
	(event:'items-drag-start', dragEvent: DragEvent, items: Song[]): void
}>();

const discs = computed((): Disc[] => {
	return props.songs.reduce((discs, item) => {
		let disc = discs[discs.length - 1];
		let discNumber = item.disc_number;
		if (!disc || disc.number != discNumber) {
			disc = {
				number: discNumber,
				songs: [],
			};
			discs.push(disc);
		}
		disc.songs.push(item);
		return discs;
	}, [] as Disc[]);
});

const artworkURL = computed(() => {
	for (const disc of discs.value) {
			for (const song of disc.songs) {
				if (song.artwork) {
					return makeThumbnailURL(song.artwork);
				}
			}
		}
		return "";
});

function onDiscDragStart(event: DragEvent, disc: Disc) {
	const songs = discs.value.filter(d => d.number == disc.number).map(d => d.songs).flat();
	emits('items-drag-start', event, songs);
}
</script>

<style scoped>
.details {
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	margin-bottom: 50px;
}

.coverArt {
	flex-shrink: 0;
	width: 40%;
	display: flex;
	justify-content: start;
	align-items: start;
	margin-bottom: 30px;
}

img {
	width: 100%;
	border-radius: 5px;
}

.trackList {
	flex-grow: 1;
	min-width: 0;
	cursor: default;
	margin-left: 20px;
}

.discNumber {
	font-weight: 600;
	margin-bottom: 10px;
	padding: 10px;
	padding-top: 5px;
	padding-bottom: 2px;
	color: var(--theme-background);
	background-color: var(--theme-foreground-muted);
	border-radius: 3px;
}

li:not(:first-child) .discNumber {
	margin-top: 20px;
}

.discContent {
	padding-left: 25px;
}

li.song {
	padding-left: 10px;
	padding-top: 6px;
	list-style-type: decimal;
	list-style-position: outside;
}

.songName {
	width: 100%;
	display: inline-block;
	vertical-align: text-top;
	padding-bottom: 3px;
	border-bottom: 1px solid var(--theme-border-muted);
	overflow: hidden;
	text-overflow: ellipsis;
}

li.song:last-child .songName {
	border-bottom: none;
}

li.song.no-track-number {
	list-style-type: none;
}

.trackArtist {
	color: var(--theme-foreground-muted);
}

li:first-child {
	padding-top: 0;
}

li:last-child {
	border-bottom: 0;
}
</style>