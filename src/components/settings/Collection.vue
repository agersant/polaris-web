<template>
	<form v-if="settings && mountDirs" v-on:submit.prevent>
		<div class="field">
			<label for="art_pattern">Album art pattern</label>
			<input type="text" id="art_pattern" v-model="settings.album_art_pattern"
				v-on:change="onAlbumArtPatternChanged" v-on:keypress.enter.prevent placeholder="Folder.(jpg|png)"
				data-cy="album-art-pattern" />
			<p class="tip">The regular expression used to detect album art files.</p>
			<p v-if="!validateAlbumArtPattern()" class="tip error">Please enter a valid regular expression.</p>
		</div>
		<div class="field sources">
			<label>Music sources</label>
			<table>
				<thead>
					<th>Location</th>
					<th>Name</th>
					<th />
				</thead>
				<tr v-for="(mountDir, index) in mountDirs.listing" v-bind:key="index">
					<td>
						<input type="text" v-model="mountDir.source" v-on:change="mountDirs.save"
							v-on:keypress.enter.prevent data-cy="mount-dir-source" />
					</td>
					<td>
						<input type="text" v-model="mountDir.name" v-on:change="mountDirs.save"
							data-cy="mount-dir-name" />
					</td>
					<td>
						<i v-on:click="mountDirs.remove(mountDir)" class="noselect material-icons md-18"
							data-cy="delete-mount-dir">delete</i>
					</td>
				</tr>
			</table>
			<button v-on:click="addMountDir" data-cy="add-mount-dir">Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">
				Scan collection every
				<input type="text" id="sleep_duration" v-model="reindexPeriod" @change="onReindexPeriodChanged"
					data-cy="sleep-duration" />
				minutes
			</label>
			<StateButton v-bind:submit="false" v-bind:states="reindexStates" v-bind:state="reindexState"
				@click="reindex" data-cy="reindex" />
		</div>
	</form>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { Settings } from "@/api/dto";
import { getSettings, putSettings, triggerIndex } from "@/api/endpoints";
import { useMountDirsStore } from "@/stores/mount-dirs";
import StateButton, { State } from "@/components/StateButton.vue";

const mountDirs = useMountDirsStore();

const settings: Ref<Settings | null> = ref(null);
const reindexPeriod = ref(0);
const reindexStates: Ref<Record<string, State>> = ref({
	ready: { name: "Scan now" },
	applying: { name: "Hold on…", disabled: true },
	success: { name: "On it!", disabled: true, success: true },
	failure: { name: "Error :(", disabled: true, failure: true },
});
const reindexState: Ref<State> = ref(reindexStates.value.ready);

onMounted(async () => {
	settings.value = await getSettings();
	reindexPeriod.value = Math.round(settings.value.reindex_every_n_seconds / 60);
	mountDirs.refresh();
});

function onAlbumArtPatternChanged() {
	if (validateAlbumArtPattern()) {
		commitSettings();
	}
}

function validateAlbumArtPattern() {
	try {
		if (settings.value) {
			new RegExp(settings.value.album_art_pattern);
		}
		return true;
	} catch (e) {
		return false;
	}
}

function onReindexPeriodChanged() {
	if (!settings.value) {
		return;
	}
	let periodInSeconds = Math.round(reindexPeriod.value) * 60;
	if (isNaN(periodInSeconds) || periodInSeconds < 0) {
		return;
	}
	settings.value.reindex_every_n_seconds = periodInSeconds;
	commitSettings();
}

function addMountDir() {
	mountDirs.create();
}

async function reindex() {
	reindexState.value = reindexStates.value.applying;
	const response = await triggerIndex();
	if (response.status != 200) {
		reindexState.value = reindexStates.value.failure;
		console.log("Index trigger error: " + response.status);
	} else {
		reindexState.value = reindexStates.value.success;
	}
	setTimeout(() => {
		reindexState.value = reindexStates.value.ready;
	}, 2000);
}

function commitSettings() {
	if (!settings.value) {
		return;
	}
	putSettings(settings.value);
}
</script>

<style scoped>
.sleep_duration label {
	display: inline;
}

.sleep_duration input {
	width: 50px;
	text-align: center;
}
</style>
