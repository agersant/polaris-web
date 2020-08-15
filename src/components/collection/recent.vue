<template>
	<div class="left pane">
		<div class="paneHeader">
			<h2>Recently Added</h2>
		</div>
		<div class="paneContent" ref="paneContent">
			<discography
				v-bind:showArtistName="false"
				v-bind:albums="items"
				v-on:item-click="onItemClicked"
				v-on:item-drag-start="onItemDragStart"
			></discography>
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
			API.recent().then(data => {
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

		onItemDragStart(event) {
			event.dataTransfer.setData("text/json", JSON.stringify(event.item));
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
