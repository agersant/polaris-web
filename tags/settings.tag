<settings>
	<div class="paneHeader">
		<h2>Settings</h2>
		<settings-tabs/>
	</div>

	<div class="paneContent">
		<router>
			<route path="settings/users"><settings-users/></route>
			<route path="settings/ddns"><settings-ddns/></route>
			<route path="settings/collection"><settings-collection/></route>
			<route path="settings/preferences"><settings-preferences/></route>
		</router>
	</div>

	<script>

		save(data, url) {
			eventBus.trigger("settings:submissionStatusUpdate", "applying");
			fetch(url,
				{	method: "PUT"
				,	credentials: "same-origin"
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
		}

		saveConfig(config) {
			this.save(config, "api/settings/");
		}

		savePreferences(preferences) {
			this.save(preferences, "api/preferences/");
		}

		eventBus.on("settings:submitConfig", this.saveConfig);
		eventBus.on("settings:submitPreferences", this.savePreferences);
		this.on("unmount", function() {
			this.dead = true;
			eventBus.off("settings:submitConfig");
			eventBus.off("settings:savePreferences");
		}.bind(this));
	</script>

	<style>
		.paneContent {
			padding-top: 50px;
		}
	</style>

</settings>
