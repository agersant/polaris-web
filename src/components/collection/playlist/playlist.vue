<template>
	<div class="browser">
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
		explorer: Explorer
	},

	data() {
		return {
			name: "",
			tracks: null
		};
	},

	mounted() {
		this.listTracks();
	},

	watch: {
		$route(to, from) {
			this.listTracks();
		}
	},

	methods: {
		listTracks() {
			this.name = this.$route.params.pathMatch;
			API.request("/playlist/" + encodeURIComponent(this.name))
				.then(res => res.json())
				.then(data => {
					this.tracks = data.map(d => {
						return { fields: d, variant: "Song" };
					});
				});
		},

		play() {
			this.$store.dispatch("playlist/queuePlaylist", this.name);
		},

		deletePlaylist() {
			API.request("/playlist/" + encodeURIComponent(this.name), { method: "DELETE" }).then(res => {
				this.$router.push("/playlists");
			});
		},

		onItemClicked(item) {
			this.$store.dispatch("playlist/queueTracks", [item.fields]);
		},

		onItemDragStart(event, item) {
			event.dataTransfer.setData("text/json", JSON.stringify(item));
		}
	}
};
</script>

<style scoped>
/*TODO this whole style block is copy pasta from browser*/
.paneContent {
	padding-top: 50px;
}

.viewActions {
	margin-bottom: 40px;
	font-size: 0;
}

.viewActions .header {
	line-height: 1;
	margin-bottom: 5px;
	font-size: 1.25rem;
	font-family: "Montserrat", "sans-serif";
}

.viewActions .subHeader {
	line-height: 1;
	font-size: 1.25rem;
	margin-bottom: 5px;
	color: var(--theme-foreground-muted);
}

.viewActions button {
	display: inline;
}
</style>

