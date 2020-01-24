<template>
	<ul>
		<li
			draggable="true"
			v-for="(item, index) in items"
			v-bind:key="index"
			v-on:click="$emit('itemClick', item)"
			v-on:dragstart="$emit('itemDragStart', item)"
		>
			<div v-if="item.variant == 'Directory'" class="directory">
				<i class="material-icons">folder</i>
				{{ item.fields.name }}
			</div>
			<div v-if="item.variant == 'Song'" class="song">{{ formatExplorerTrackDetails(item) }}</div>
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
	}
};
</script>

<style scoped>
.explorerActions {
	margin-bottom: 20px;
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