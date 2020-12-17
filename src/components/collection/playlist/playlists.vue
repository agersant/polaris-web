<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>

		<div class="paneContent">
			<ul v-if="playlists.listing.length > 0">
				<li
					v-for="(playlist, index) in playlists.listing"
					v-bind:key="index"
					class="noselect"
					draggable="true"
					v-on:click="onItemClicked(playlist)"
					v-on:dragstart="event => onPlaylistDragStart(event, playlist)"
				>
					{{ playlist.name }}
				</li>
			</ul>
			<div class="help" v-if="playlists.listing.length == 0">
				<i class="material-icons md-48">playlist_add</i>
				<br />Save a playlist by pressing the <i class="save material-icons md-20">save</i> button above it.
				<br />
			</div>
		</div>
	</div>
</template>

<script>
import { mapState } from "vuex";
import API from "/src/api";
export default {
	data() {
		return {};
	},

	computed: {
		...mapState(["playlists"]),
	},

	mounted() {
		this.$store.dispatch("playlists/refresh");
	},

	methods: {
		onItemClicked(playlist) {
			this.$router.push("/playlist/" + playlist.name).catch(err => {});
		},

		onPlaylistDragStart(event, playlist) {
			const playlistItem = {
				variant: "Playlist",
				fields: {
					name: playlist.name,
				},
			};
			event.dataTransfer.setData("text/json", JSON.stringify([playlistItem]));
		},
	},
};
</script>

<style scoped>
ul {
	margin-bottom: 40px;
}

li:not(:last-child) {
	border-bottom: 1px solid var(--theme-border-muted);
}

li:not(:first-child) {
	padding-top: 8px;
}

li {
	cursor: pointer;
	padding-bottom: 6px;
}

.help i.save {
	position: relative;
	top: 4px;
}
</style>