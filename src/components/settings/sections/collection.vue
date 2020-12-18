<template>
	<form v-if="settings && mountDirs" v-on:submit.prevent>
		<div class="field">
			<label for="art_pattern">Album art pattern</label>
			<input type="text" id="art_pattern" v-model="settings.album_art_pattern" v-on:change="onAlbumArtPatternChanged" v-on:keypress.enter.prevent placeholder="Folder.(jpg|png)" />
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
				<tr v-for="(mountDir, index) in mountDirs" v-bind:key="index">
					<td>
						<input type="text" v-model="mountDir.source" v-on:change="commitMountDirs" v-on:keypress.enter.prevent />
					</td>
					<td>
						<input type="text" v-model="mountDir.name" v-on:change="commitMountDirs" />
					</td>
					<td>
						<i v-on:click="deleteMountDir(index)" class="noselect material-icons md-18">delete</i>
					</td>
				</tr>
			</table>
			<button v-on:click="addMountDir">Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">
				Scan collection every
				<input type="text" id="sleep_duration" v-model="reindexPeriod" v-on:change="onReindexPeriodChanged" /> minutes
			</label>
			<state-button ref="reindex" v-bind:submit="false" v-bind:states="reindexStates" v-bind:state="reindexState" v-on:click="reindex" />
		</div>
	</form>
</template>

<script>
import API from "/src/api";
import StateButton from "/src/components/state-button";
export default {
	components: {
		"state-button": StateButton,
	},

	data() {
		return {
			settings: null,
			mountDirs: null,
			reindexPeriod: 0,
			reindexStates: {
				ready: { name: "Scan now" },
				applying: { name: "Hold on…", disabled: true },
				success: { name: "On it!", disabled: true, success: true },
				failure: { name: "Error :(", disabled: true, failure: true },
			},
			reindexState: null,
		};
	},

	mounted() {
		this.reindexState = this.reindexStates.ready;
		API.getSettings().then(data => {
			this.settings = data;
			this.reindexPeriod = Math.round(data.reindex_every_n_seconds / 60);
		});
		API.getMountDirs().then(data => {
			this.mountDirs = data;
		});
	},

	methods: {
		onAlbumArtPatternChanged() {
			if (this.validateAlbumArtPattern()) {
				this.commitSettings();
			}
		},

		validateAlbumArtPattern() {
			try {
				new RegExp(this.settings.album_art_pattern);
				return true;
			} catch (e) {
				return false;
			}
		},

		onReindexPeriodChanged() {
			let periodInSeconds = Math.round(this.reindexPeriod) * 60;
			if (isNaN(periodInSeconds) || periodInSeconds < 0) {
				return;
			}
			this.settings.reindex_every_n_seconds = periodInSeconds;
			this.commitSettings();
		},

		addMountDir() {
			this.mountDirs.push({ name: "", source: "" });
		},

		deleteMountDir(index) {
			this.mountDirs.splice(index, 1);
			this.commitMountDirs();
		},

		reindex() {
			this.reindexState = this.reindexStates.applying;
			API.triggerIndex().then(res => {
				if (res.status != 200) {
					this.reindexState = this.reindexStates.failure;
					console.log("Index trigger error: " + res.status);
				} else {
					this.reindexState = this.reindexStates.success;
				}
				setTimeout(() => {
					this.reindexState = this.reindexStates.ready;
				}, 2000);
			});
		},

		commitSettings() {
			API.putSettings(this.settings);
		},

		commitMountDirs() {
			API.putMountDirs(this.mountDirs);
		},
	},
};
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
