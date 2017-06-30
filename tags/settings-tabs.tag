<settings-tabs>
	<span each={ tabs } onclick={ onClickTab } class={ noselect: 1, selected: currentSection == section }>
		{ name }
  	</span>

	<script>
		this.tabs = [
			{ name: "Collection", section: "collection" },
			{ name: "Users", section: "users" },
			{ name: "Dynamic DNS", section: "ddns" }
		];

		route(function(currentURL, section) {
			this.currentSection = section || this.tabs[0].section;
		}.bind(this));

		onClickTab(e) {
			var newURL = "settings/" + e.item.section;
			route(newURL);
		}

		this.on('mount', function() {
			route.exec();
		});
	</script>

	<style>
		span {
			cursor: pointer;
			color: #BBB;
		}

		span + span {
			margin-left: 20px;
		}

		.selected {
			color: #44C8F1;
			border-bottom: 2px solid #44C8F1;
		}
	</style>

</settings-tabs>