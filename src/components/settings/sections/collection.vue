<template>
	<form v-if="settings">
		<div class="field">
			<label for="art_pattern">Album art pattern</label>
			<input
				type="text"
				id="art_pattern"
				v-model="settings.album_art_pattern"
				v-on:change="onAlbumArtPatternChanged"
				placeholder="Folder.(jpg|png)"
			/>
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
				<tr v-for="(mountPoint, index) in settings.mount_dirs" v-bind:key="index">
					<td>
						<input type="text" v-model="mountPoint.source" v-on:change="commit" />
					</td>
					<td>
						<input type="text" v-model="mountPoint.name" v-on:change="commit" />
					</td>
					<td>
						<i v-on:click="deleteMountPoint(index)" class="noselect material-icons md-18">delete</i>
					</td>
				</tr>
			</table>
			<button v-on:click="addMountPoint">Add more</button>
		</div>
		<div class="field sleep_duration">
			<label for="sleep_duration">
				Scan collection every
				<input
					type="text"
					id="sleep_duration"
					v-model="reindexPeriod"
					v-on:change="onReindexPeriodChanged"
				/> minutes
			</label>
			<state-button
				ref="reindex"
				v-bind:submit="false"
				v-bind:states="reindexStates"
				v-bind:state="reindexState"
				v-on:click="reindex"
			/>
		</div>
	</form>
</template>

<script>
import * as Utils from "/src/utils";
import StateButton from "/src/components/state-button";
export default {
	components: {
		"state-button": StateButton
	},

	data() {
		return {
			settings: null,
			reindexPeriod: 0,
			reindexStates: {
				ready: { name: "Scan now" },
				applying: { name: "Hold on…", disabled: true },
				success: { name: "On it!", disabled: true, success: true },
				failure: { name: "Error :(", disabled: true, failure: true }
			},
			reindexState: null
		};
	},

	mounted() {
		this.reindexState = this.reindexStates.ready;
		Utils.api("/settings")
			.then(res => res.json())
			.then(data => {
				this.settings = data;
				this.reindexPeriod = Math.round(data.reindex_every_n_seconds / 60);
			});
	},

	methods: {
		onAlbumArtPatternChanged() {
			if (this.validateAlbumArtPattern()) {
				this.commit();
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
			this.commit();
		},

		addMountPoint() {
			this.settings.mount_dirs.push({ name: "", source: "" });
		},

		deleteMountPoint(index) {
			this.settings.mount_dirs.splice(index, 1);
		},

		reindex() {
			this.reindexState = this.reindexStates.applying;
			Utils.api("/trigger_index", { method: "POST" }).then(res => {
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

		commit() {
			Utils.api("/settings", {
				method: "PUT",
				body: JSON.stringify(this.settings),
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	}
};
</script>

<style scoped>
.sleep_duration label {
	display: inline;
}

.sleep_duration input {
	width: 50px;
	text-align: right;
}
</style>
