<settings-tabs>
	<span each={ tabs } onclick={ onClickTab } class={ noselect: 1, selected: currentSection == section }>
		{ name }
  	</span>

	<script>
		route(function(currentURL, section) {
			this.currentSection = section || this.tabs[0].section;
		}.bind(this));

		onClickTab(e) {
			var newURL = "settings/" + e.item.section;
			route(newURL);
		}

		this.on('mount', function() {
			this.tabs = [
				{ name: "Preferences", section: "preferences" },
			];
			if (Cookies.get("admin") == "true") {
				this.tabs.push({ name: "Collection", section: "collection" });
				this.tabs.push({ name: "Users", section: "users" });
				this.tabs.push({ name: "Dynamic DNS", section: "ddns" });
			}
			route.exec();
		});
	</script>

	<style>
		span {
			cursor: pointer;
			color: var(--theme-foreground-muted);
			line-height: 1rem;
			font-size: 1rem;
		}

		span + span {
			margin-left: 20px;
		}

		.selected {
			color: var(--theme-accent);
			border-bottom: 1px solid var(--theme-accent);
		}
	</style>

</settings-tabs>