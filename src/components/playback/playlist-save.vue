<template>
	<div class="popup">
		<div class="close">
			<i class="material-icons md-18" v-on:click.stop="cancel">close</i>
		</div>
		<form v-on:submit.prevent="save">
			<label for="playlist_name">
				Playlist name:
				<input type="text" id="playlist_name" v-model="name" placeholder="Cool Playlist" />
			</label>
			<state-button v-bind:submit="true" v-bind:states="saveStates" v-bind:state="saveState"></state-button>
		</form>
	</div>
</template>

<script>
import { mapState } from "vuex";
import API from "/src/api";
import StateButton from "/src/components/state-button";
export default {
	components: {
		"state-button": StateButton
	},

	props: {
		tracks: {
			type: Array,
			required: true
		}
	},

	data() {
		return {
			saveStates: {
				ready: { name: "Save" },
				saving: { name: "Saving…", disabled: true },
				success: { name: "Saved!", disabled: true, success: true },
				failure: { name: "Error :(", disabled: true, failure: true }
			},
			saveState: null
		};
	},

	computed: {
		...mapState(["playlist"]),
		name: {
			set(name) {
				this.$store.dispatch("playlist/setName", name);
			},
			get() {
				return this.playlist.name;
			}
		}
	},

	created() {
		this.saveState = this.saveStates.ready;
		this.initialName = this.name;
	},

	methods: {
		cancel() {
			this.$store.dispatch("playlist/setName", this.initialName);
			this.$emit("cancel");
		},

		save() {
			this.saveState = this.saveStates.saving;
			let tracks = this.tracks.map(t => t.info.path);
			API.putPlaylist(this.name, tracks).then(res => {
				let status = res.ok ? "success" : "failure";
				this.saveState = this.saveStates[status];
				this.$store.dispatch("playlists/refresh");
				setTimeout(() => {
					if (res.ok) {
						this.$emit("complete");
					} else {
						this.saveState = this.saveStates.ready;
					}
				}, 1000);
			});
		}
	}
};
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
