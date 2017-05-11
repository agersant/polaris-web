<browser-tabs>
	<a each={ tabs } href="#{ url }" class={ noselect: 1, selected: parent.currentURL == url }>
		{ name }
  	</a>

	<script>
		this.tabs = [
			{ name: "All Music", url: "browse" },
			{ name: "Random Albums", url: "random" },
			{ name: "Recently Added", url: "recent" }
		];

		route(function(currentURL, a) {
			this.currentURL = currentURL || this.tabs[0].url;
		}.bind(this));
	</script>

	<style>
		a {
			color: #BBB;
		}

		a + a {
			margin-left: 20px;
		}

		.selected {
			color: #FFF;
			border-bottom: 2px solid #44C8F1;
		}
	</style>

</browser-tabs>