<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>
		<div data-cy="saved-playlist-details" v-if="tracks" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ name }}</div>
				<button v-if="tracks.length > 0" v-on:click="play" class="small">Play</button>
				<button v-on:click="deletePlaylist" class="danger small">Delete</button>
			</div>

			<explorer v-bind:items="tracks" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></explorer>
		</div>
	</div>
</template>

<script>
import { ref, watch} from "vue";
import API from "/src/api";
import Explorer from "/src/components/collection/layout/explorer";
export default {
	components: {
		explorer: Explorer,
	},

	props: {
		name: {
			type: String,
			required: true,
		},
	},

	setup(props) {
		const tracks = ref(null);
		watch(
			() => props.name,
			async (name) => {
				tracks.value = null;
				tracks.value = (await API.getPlaylist(name)).map(d => {
					return { fields: d, variant: "Song" };
				});
			},
			{immediate: true}
		);
		return {tracks};
	},

	methods: {
		play() {
			this.$store.dispatch("playlist/queuePlaylist", this.name);
		},

		deletePlaylist() {
			API.deletePlaylist(this.name).then(() => {
				this.$router.push("/playlists").catch(err => {});
			});
		},

		onItemClicked(item) {
			this.$store.dispatch("playlist/queueTracks", [{...item.fields}]);
		},

		onItemsDragStart(event, items) {
			event.dataTransfer.setData("text/json", JSON.stringify(items));
		},
	},
};
</script>
