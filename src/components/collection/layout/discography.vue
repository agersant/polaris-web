<template>
	<div>
		<ul>
			<li
				data-cy="album"
				class="album"
				draggable="true"
				v-for="(item, index) in items"
				v-bind:key="index"
				v-on:click="$emit('itemClick', item)"
				v-on:dragstart="$emit('itemDragStart', item)"
			>
				<div class="cover">
					<div class="coverCanvas">
						<img v-if="item.fields.artwork" v-bind:src="item.fields.artworkURL" />
					</div>
				</div>
				<div class="details">
					<div class="title">{{ item.fields.album }}</div>
					<div v-if="showArtistName" class="artist">{{ item.fields.artist }}</div>
					<div class="year">{{ item.fields.year }}</div>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		items: {
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