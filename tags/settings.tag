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

		save(formData, url) {
			eventBus.trigger("settings:submissionStatusUpdate", "applying");
			fetch(url,
				{	method: "PUT"
				,	credentials: "same-origin"
				,	body: formData
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
			var data = new FormData();
			data.append( "config", JSON.stringify(config) );
			this.save(data, "api/settings/");
		}

		savePreferences(preferences) {
			var data = new FormData();
			data.append("preferences", JSON.stringify(preferences));
			this.save(data, "api/preferences/");
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
