<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Playlists</h2>
		</div>

		<div data-cy="saved-playlists" class="paneContent">
			<ul v-if="playlists.listing.length > 0">
				<li data-cy="saved-playlist" v-for="(playlist, index) in playlists.listing" v-bind:key="index"
					class="noselect" draggable="true" v-on:click="onItemClicked(playlist)"
					v-on:dragstart="event => onPlaylistDragStart(event, playlist)">
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

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { ListPlaylistsEntry } from "@/api/dto";
import { usePlaylistsStore } from "@/stores/playlists";

const router = useRouter();
const playlists = usePlaylistsStore();

onMounted(()=>{
	playlists.refresh();
});

function onItemClicked(playlist: ListPlaylistsEntry) {
	router.push("/playlist/" + encodeURIComponent(playlist.name)).catch(err => { });
}

function onPlaylistDragStart(event: DragEvent, playlist: ListPlaylistsEntry) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(playlist));
}
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