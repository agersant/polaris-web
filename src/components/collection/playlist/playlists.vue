<template>
	<div class="playlists">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>

		<div class="paneContent">
			<ul v-if="playlists.length > 0">
				<li
					v-for="(playlist, index) in playlists"
					v-bind:key="index"
					class="noselect"
					draggable="true"
					v-on:click="onItemClicked(playlist)"
					v-on:dragstart="event => onItemDragStart(event, playlist)"
				>{{ playlist.name }}</li>
			</ul>
			<div class="help" v-if="playlists.length == 0">
				<i class="material-icons md-48">playlist_add</i>
				<br />Save a playlist by pressing the
				<i class="save material-icons md-20">save</i> button above it.
				<br />
			</div>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
export default {
	data() {
		return {
			playlists: []
		};
	},

	mounted() {
		this.loadPlaylists();
		// TODO needs live update when a new playlist is saved
	},

	methods: {
		loadPlaylists() {
			API.playlists().then(data => {
				this.playlists = data;
			});
		},

		onItemClicked(playlist) {
			this.$router.push("/playlist/" + playlist.name);
		},

		onItemDragStart(event, playlist) {
			const playlistItem = {
				variant: "Playlist",
				fields: {
					name: playlist.name
				}
			};
			event.dataTransfer.setData("text/json", JSON.stringify(playlistItem));
		}
	}
};
</script>

<style scoped>
.paneContent {
	padding-top: 50px;
}

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

.help {
	margin-top: -50px;
}

.help i.save {
	position: relative;
	top: 4px;
}
</style>