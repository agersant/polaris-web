<template>
	<div class="details">
		<div class="coverArt">
			<img
				v-bind:src="artworkURL"
				draggable="true"
				v-on:dragstart="event => $emit('items-drag-start', event, songs)"
			/>
		</div>
		<div class="trackList">
			<ul>
				<li v-for="(disc, index) in discs" v-bind:key="index">
					<div
						draggable="true"
						class="discNumber"
						v-if="discs.length > 1 && disc.discNumber"
						v-on:dragstart="event => $emit('items-drag-start', event, disc.songs)"
					>Disc {{ disc.discNumber }}</div>
					<ol class="discContent">
						<li
							draggable="true"
							v-bind:value="item.fields.track_number"
							v-bind:class="{ song: 1, 'no-track-number': !item.fields.track_number }"
							v-for="(item, index) in disc.songs"
							v-bind:key="index"
							v-on:click="$emit('item-click', item)"
							v-on:dragstart="event => $emit('items-drag-start', event, [item])"
						>
							<span class="songName">
								{{ formatSongTitle(item) }}
								<span
									class="trackArtist"
									v-if="item.fields.artist && item.fields.album_artist && item.fields.artist != item.fields.album_artist"
								>({{ item.fields.artist }})</span>
							</span>
						</li>
					</ol>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
import * as Format from "/src/format";
export default {
	props: {
		items: {
			type: Array,
			required: true,
		},
	},

	data: function () {
		return {};
	},

	computed: {
		discs: function () {
			return this.songs.reduce((discs, item) => {
				let disc = discs[discs.length - 1];
				let discNumber = item.fields.disc_number;
				if (!disc || disc.discNumber != discNumber) {
					disc = {
						discNumber: discNumber,
						songs: [],
					};
					discs.push(disc);
				}
				disc.songs.push(item);
				return discs;
			}, []);
		},

		songs: function () {
			return this.items.sort((a, b) => {
				const discA = a.fields.disc_number || 0;
				const discB = b.fields.disc_number || 0;
				if (discA != discB) {
					return discA - discB;
				}
				return (a.fields.track_number || 0) - (b.fields.track_number || 0);
			});
		},

		artworkURL: function () {
			for (const disc of this.discs) {
				for (const song of disc.songs) {
					if (song.fields.artwork) {
						return API.makeThumbnailURL(song.fields.artwork);
					}
				}
			}
			return "";
		},
	},

	methods: {
		formatSongTitle(item) {
			return Format.title(item.fields);
		},
	},
};
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
	width: 12vw;
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