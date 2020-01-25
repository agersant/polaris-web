<template>
	<div class="settings">
		<div class="paneHeader">
			<h2>Settings</h2>
			<tabs></tabs>
		</div>

		<div class="paneContent">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import Tabs from "./tabs";
export default {
	components: {
		tabs: Tabs
	},
	methods: {}
};
/*
	save(data, url) {
		eventBus.trigger("settings:submissionStatusUpdate", "applying");
		utils.api(url,
			{	method: "PUT"
			,	body: JSON.stringify(data)
			,	headers: {
					'Content-Type': 'application/json'
				}
			}
		)
		.then(function(res) {
			if (this.dead) {
				return;
			}
			var status = res.ok ? "success" : "failure";
			eventBus.trigger("settings:submissionStatusUpdate", status);
			this.update();

			setTimeout(function() {
				if (this.dead) {
					return;
				}
				eventBus.trigger("settings:submissionStatusUpdate", "ready");
				this.update();
			}.bind(this), 2000);
		}.bind(this));
	},

	saveConfig(config) {
		this.save(config, "/settings");
	},

	savePreferences(preferences) {
		this.save(preferences, "/preferences");
	}

	eventBus.on("settings:submitConfig", this.saveConfig);
	eventBus.on("settings:submitPreferences", this.savePreferences);
	this.on("unmount", function() {
		this.dead = true;
		eventBus.off("settings:submitConfig");
		eventBus.off("settings:savePreferences");
	}.bind(this));
	*/
</script>

<style scoped>
.paneContent {
	padding-top: 50px;
}
</style>
