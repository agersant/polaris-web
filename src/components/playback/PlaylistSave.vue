<template>
	<div class="popup">
		<div class="close">
			<i class="material-icons md-18" v-on:click.stop="cancel">close</i>
		</div>
		<form v-on:submit.prevent="save">
			<label for="playlist_name">
				Playlist name:
				<input data-cy="playlist-save-name" type="text" id="playlist_name" v-model="newName"
					placeholder="Cool Playlist" />
			</label>
			<StateButton data-cy="playlist-save-commit" v-bind:submit="true" v-bind:states="states"
				v-bind:state="state" />
		</form>
	</div>
</template>

<script setup lang="ts">
import { Song } from "@/api/dto";
import { putPlaylist } from "@/api/endpoints";
import StateButton, { State } from "@/components/StateButton.vue";
import { usePlaylistStore } from "@/stores/playlist";
import { usePlaylistsStore } from "@/stores/playlists";
import { computed, onMounted, ref, Ref } from "vue";

const playlist = usePlaylistStore();
const playlists = usePlaylistsStore();

const props = defineProps<{
	tracks: Song[]
}>();

const emits = defineEmits<{
	(event: "cancel"): void
	(event: "complete"): void
}>();

const states: Ref<Record<string, State>> = ref({
	ready: { name: "Save" },
	saving: { name: "Saving…", disabled: true },
	success: { name: "Saved!", disabled: true, success: true },
	failure: { name: "Error :(", disabled: true, failure: true },
});
const state: Ref = ref(states.value.ready);
const initialName = ref("");
const newName = computed({
	get: () => playlist.name,
	set: (value) => playlist.setName(value),
});

onMounted(() => {
	initialName.value = playlist.name;
});

function cancel() {
	playlist.setName(initialName.value);
	emits("cancel");
}

async function save() {
	state.value = states.value.saving;
	const songPaths = props.tracks.map(s => s.path);
	const response = await putPlaylist(newName.value, songPaths);
	let status = response.ok ? "success" : "failure";
	state.value = states.value[status];
	playlists.refresh();
	setTimeout(() => {
		if (response.ok) {
			emits("complete");
		} else {
			state.value = states.value.ready;
		}
	}, 1000);
}
</script>

<style scoped>
.popup {
	cursor: default;
	position: absolute;
	width: 400px;
	background-color: var(--theme-background);
	border: 1px solid var(--theme-border-muted);
	border-bottom: 2px solid var(--theme-accent);
	animation: 0.15s ease-out 0s 1 intro;
}

.close {
	cursor: pointer;
	position: absolute;
	top: 5px;
	right: 5px;
}

form {
	padding: 20px;
}

input {
	width: inherit;
	margin-left: 10px;
}

label {
	margin-bottom: 15px;
}

@keyframes intro {
	0% {
		transform: translateX(-50px);
		opacity: 0;
	}

	100% {
		transform: translateX(0);
		opacity: 1;
	}
}
</style>
