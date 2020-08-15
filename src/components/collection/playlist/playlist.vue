<template>
	<div class="left pane">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>
		<div v-if="tracks" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ name }}</div>
				<button v-if="tracks.length > 0" v-on:click="play" class="small">Play</button>
				<button v-on:click="deletePlaylist" class="danger small">Delete</button>
			</div>

			<explorer
				v-bind:items="tracks"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
			></explorer>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
import Explorer from "/src/components/collection/layout/explorer";
export default {
	components: {
		explorer: Explorer,
	},

	data() {
		return {
			name: "",
			tracks: null,
		};
	},

	mounted() {
		this.listTracks();
	},

	watch: {
		$route(to, from) {
			this.listTracks();
		},
	},

	methods: {
		listTracks() {
			this.name = this.$route.params.pathMatch;
			API.getPlaylist(this.name).then((data) => {
				this.tracks = data.map((d) => {
					return { fields: d, variant: "Song" };
				});
			});
		},

		play() {
			this.$store.dispatch("playlist/queuePlaylist", this.name);
		},

		deletePlaylist() {
			API.deletePlaylist(this.name).then(() => {
				this.$router.push("/playlists").catch((err) => {});
			});
		},

		onItemClicked(item) {
			this.$store.dispatch("playlist/queueTracks", [item.fields]);
		},

		onItemDragStart(event, item) {
			event.dataTransfer.setData("text/json", JSON.stringify(item));
		},
	},
};
</script>
