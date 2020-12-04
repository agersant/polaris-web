<template>
	<div class="left pane">
		<div class="paneHeader">
			<h2>Random</h2>
			<div class="more noselect" v-on:click="refresh">
				<i class="material-icons md-18">refresh</i>
				<span>More</span>
			</div>
		</div>
		<div class="paneContent" ref="paneContent">
			<discography v-bind:showArtistName="false" v-bind:albums="items" v-on:item-click="onItemClicked" v-on:items-drag-start="onItemsDragStart"></discography>
		</div>
	</div>
</template>

<script>
import API from "/src/api";
import Discography from "./layout/discography";
export default {
	components: {
		discography: Discography,
	},

	data() {
		return {
			items: [],
		};
	},

	mounted() {
		this.refresh();
	},

	methods: {
		refresh() {
			this.items = [];
			API.random().then(data => {
				this.items = data.map(a => {
					return {
						fields: a,
						variant: "Directory",
					};
				});
			});
		},

		onItemClicked(item) {
			this.$router.push("/browse/" + item.fields.path).catch(err => {});
		},

		onItemsDragStart(event, items) {
			event.dataTransfer.setData("text/json", JSON.stringify(items));
		},
	},
};
</script>

<style scoped>
.more {
	cursor: pointer;
	height: 20px;
}

.more span {
	padding-left: 4px;
	font-size: 0.875rem;
	vertical-align: top;
}
</style>
