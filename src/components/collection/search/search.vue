<template>
	<div class="browser">
		<div class="paneHeader">
			<h2>Search</h2>
			<search-input></search-input>
		</div>
		<div v-if="query && results" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ results.length }} results found for '{{ query }}'</div>
				<button v-if="results.length > 0" v-on:click="queueAll" class="small">Queue All</button>
			</div>
			<explorer
				v-bind:items="results"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
			></explorer>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
import Explorer from "/src/components/collection/layout/explorer";
import SearchInput from "/src/components/collection/search/search-input";
export default {
	components: {
		explorer: Explorer,
		"search-input": SearchInput
	},

	data() {
		return {
			query: null,
			results: null
		};
	},

	mounted() {
		this.search();
	},

	watch: {
		$route(to, from) {
			this.search();
		}
	},

	methods: {
		search() {
			let query = this.$route.params.pathMatch;
			if (query.startsWith("/")) {
				query = query.substring(1);
			}
			this.query = query;

			const url = "/search/" + encodeURIComponent(this.query);
			API.request(url)
				.then(res => res.json())
				.then(data => {
					// TODO this is duplicated with browser
					for (let i = 0; i < data.length; i++) {
						data[i].fields = data[i].Directory || data[i].Song;
						data[i].variant = data[i].Directory ? "Directory" : "Song";
						let slices = data[i].fields.path.replace(/\\/g, "/").split("/");
						slices = slices.filter(function(s) {
							return s.length > 0;
						});
						data[i].fields.name = slices[slices.length - 1];
					}
					this.results = data;
				});
		},

		queueAll() {
			let songItems = [];
			let directoryItems = [];
			this.results.forEach(item => {
				if (item.variant == "Song") {
					songItems.push(item.fields);
				} else if (item.variant == "Directory") {
					directoryItems.push(item);
				}
			});
			this.$store.dispatch("playlist/queueTracks", songItems);
			directoryItems.forEach(item => {
				this.$store.dispatch("playlist/queueDirectory", item.fields.path);
			});
		},

		onItemClicked(item) {
			const variant = item.variant;
			if (variant == "Directory") {
				this.$router.push("/browse/" + item.fields.path).catch(err => {});
			} else if (variant == "Song") {
				this.$store.dispatch("playlist/queueTracks", [item.fields]);
			}
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

