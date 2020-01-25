<template>
	<div class="browser">
		<div class="paneHeader">
			<h2>Recently Added</h2>
		</div>
		<div class="paneContent" ref="paneContent">
			<discography
				v-bind:showArtistName="false"
				v-bind:albums="items"
				v-on:itemClick="onItemClicked"
				v-on:itemDragStart="onItemDragStart"
			></discography>
		</div>
	</div>
</template>

<script>
import * as Utils from "/src/utils";
import Discography from "./layout/discography";
export default {
	components: {
		discography: Discography
	},

	data() {
		return {
			items: []
		};
	},

	mounted() {
		this.refresh();
	},

	methods: {
		refresh() {
			this.items = [];
			Utils.api("/recent")
				.then(function(res) {
					return res.json();
				})
				.then(data => {
					this.items = data.map(a => {
						return {
							fields: a,
							variant: "Directory"
						};
					});
				});
		},

		onItemClicked(item) {
			this.$router.push("/browse/" + item.fields.path).catch(err => {});
		},

		onItemDragStart(e) {
			// TODO
			e.dataTransfer.setData("text/json", JSON.stringify(e.item));
		}
	}
};
/*
	onDragAlbumStart(e) {
		// TODO
		var directoryItem = {
			variant: "Directory",
			fields: {
				path: this.path,
			},
		};
		e.dataTransfer.setData("text/json", JSON.stringify(directoryItem));
	}
	*/
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

.paneContent {
	padding-top: 50px;
}
</style>
