<template>
	<div>
		<ul>
			<li
				data-cy="album"
				class="album"
				draggable="true"
				v-for="(album, index) in albums"
				v-bind:key="index"
				v-on:click="$emit('itemClick', album)"
				v-on:dragstart="$emit('itemDragStart', album)"
			>
				<div class="cover">
					<div class="coverCanvas">
						<img v-if="album.fields.artwork" v-bind:src="album.fields.artworkURL" />
					</div>
				</div>
				<div class="details">
					<div class="title">{{ album.fields.album }}</div>
					<div v-if="showArtistName" class="artist">{{ album.fields.artist }}</div>
					<div class="year">{{ album.fields.year }}</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		albums: {
			type: Array,
			required: true
		},
		showArtistName: {
			type: Boolean,
			required: true
		}
	},

	data: function() {
		return {};
	}
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

.coverCanvas {
	position: absolute;
	width: 100%;
	height: 100%;
}

img {
	width: 100%;
	height: 100%;
	border-radius: 5px;
}

.details {
	padding: 10px 0;
	width: 100%;
}

.details .title {
	font-family: "Montserrat", "sans-serif";
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 10px;
	font-size: 1rem;
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