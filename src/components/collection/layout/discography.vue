<template>
	<ul>
		<li
			data-cy="album"
			class="album"
			draggable="true"
			v-for="(album, index) in albums"
			v-bind:key="index"
			v-on:click="$emit('item-click', album)"
			v-on:dragstart="event => onItemDragStart(event, album)"
		>
			<div class="cover">
				<cover-art v-if="album.fields.artwork" v-bind:url="getArtworkURL(album)"></cover-art>
			</div>
			<div class="details">
				<div class="title">{{ album.fields.album }}</div>
				<div v-if="showArtistName" class="artist">{{ album.fields.artist }}</div>
				<div class="year">{{ album.fields.year }}</div>
			</div>
		</li>
	</ul>
</template>

<script>
import API from "/src/api";
import CoverArt from "/src/components/cover-art";
export default {
	components: {
		"cover-art": CoverArt,
	},

	props: {
		albums: {
			type: Array,
			required: true,
		},
		showArtistName: {
			type: Boolean,
			required: true,
		},
	},

	data: function () {
		return {};
	},

	methods: {
		getArtworkURL(album) {
			return API.makeThumbnailURL(album.fields.artwork);
		},

		onItemDragStart(event, album) {
			event.dataTransfer.setData("text/json", JSON.stringify(album));
		},
	},
};
</script>

<style scoped>
ul {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
}

.album {
	font-size: 0;
	margin-bottom: 20px;
	cursor: default;
	width: 23.5%;
	margin-left: 1%;
	margin-right: 1%;
}

.album:nth-child(4n + 1) {
	margin-left: 0;
}
.album:nth-child(4n) {
	margin-right: 0;
}

.cover {
	width: 100%;
	position: relative;
}

.cover:after {
	/*Hack to make this element stay square when its width changes*/
	content: "";
	display: block;
	padding-bottom: 100%;
}

.details {
	padding: 10px 0;
	width: 100%;
}

.details .title {
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	font-size: 1rem;
	font-weight: 400;
	line-height: 1.25;
}

.details .artist {
	margin-bottom: -5px;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	font-size: 0.875rem;
}

.details .year {
	font-size: 0.875rem;
	color: var(--theme-foreground-muted);
}
</style>