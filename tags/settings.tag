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
		</router>
	</div>

	<script>

		save(config) {
			var data = new FormData();
			data.append( "config", JSON.stringify( config ) );
			eventBus.trigger("settings:submissionStatusUpdate", "applying");
			fetch("api/settings/",
				{	method: "PUT"
				,	credentials: "same-origin"
				,	body: data
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

		eventBus.on("settings:submit", this.save);
		this.on("unmount", function() {
			this.dead = true;
			eventBus.off("settings:submit");
		}.bind(this));
	</script>

	<style>
		.paneContent {
			padding-top: 50px;
		}
	</style>

</settings>
