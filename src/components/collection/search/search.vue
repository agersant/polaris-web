<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Search</h2>
			<search-input></search-input>
		</div>
		<div v-if="query && results" class="paneContent" ref="paneContent">
			<div class="viewActions">
				<div class="header">{{ results.length }} results found for '{{ query }}'</div>
				<button v-if="results.length > 0" v-on:click="queueAll" class="small">Queue All</button>
			</div>
			<explorer v-bind:items="results" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></explorer>
		</div>
	</div>
</template>

<script>
import { ref, watch} from "vue";
import API from "/src/api";
import Explorer from "/src/components/collection/layout/explorer";
import SearchInput from "/src/components/collection/search/search-input";
export default {
	components: {
		explorer: Explorer,
		"search-input": SearchInput,
	},

	props: {
		query: {
			type: String,
			required: true,
		},
	},


	setup(props) {
		const results = ref(null);
		watch(
			() => props.query,
			async (query) => {
				results.value = null;
				results.value = await API.search(query);
			},
			{immediate: true}
		);
		return {results};
	},

	methods: {
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

		onItemsDragStart(event, items) {
			event.dataTransfer.setData("text/json", JSON.stringify(items));
		},
	},
};
</script>
