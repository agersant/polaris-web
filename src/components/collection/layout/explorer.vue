<template>
	<ul class="explorerView">
		<li
			draggable="true"
			v-for="(item, index) in items"
			v-bind:key="index"
			v-on:click="$emit('itemClick', item)"
			v-on:dragstart="event => $emit('itemDragStart', event, item)"
		>
			<div v-if="item.variant == 'Directory'" class="directory">
				<i class="material-icons">folder</i>
				{{ formatDirectoryName(item) }}
			</div>
			<div v-if="item.variant == 'Song'" class="song">{{ formatTrackDetails(item) }}</div>
		</li>
	</ul>
</template>

<script>
export default {
	props: {
		items: {
			type: Array,
			required: true
		}
	},

	data: function() {
		return {};
	},

	methods: {
		formatTrackDetails(item) {
			let details = "";
			if (item.fields.artist) {
				details += item.fields.artist;
				details += " - ";
			}
			if (item.fields.track_number) {
				details += item.fields.track_number;
				details += ". ";
			}
			if (item.fields.title) {
				details += item.fields.title;
			} else {
				details += utils.stripFileExtension(utils.getPathTail(item.fields.path));
			}
			return details;
		},

		formatDirectoryName(item) {
			var slices = item.fields.path.replace(/\\/g, "/").split("/");
			slices = slices.filter(function(s) {
				return s.length > 0;
			});
			return slices[slices.length - 1];
		}
	}
};
</script>

<style scoped>
.explorerView {
	margin-bottom: 50px;
}

.directory .material-icons {
	vertical-align: bottom;
	margin-right: 5px;
	padding-bottom: 3px;
}

.directory,
.song {
	cursor: default;
	max-width: 100%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>