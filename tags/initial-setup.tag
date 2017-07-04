<initial-setup>
	<div class="setupContainer">
		<div class="logo"><img src="img/logo_no_text.png"/></div>
		<div id="initial-setup-page"/>
	</div>

	<script>
		this.on("mount", function(){
			riot.mount("#initial-setup-page", "initial-setup-welcome");
			fetch("api/settings/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.config = data;
			}.bind(this));
		});

		eventBus.on("initialSetupMount", function(mountPoint) {
			if (!this.config) {
				return;
			}
			this.config.mount_dirs = [mountPoint];
			this.commit();
			eventBus.trigger("initialSetupNext");
		}.bind(this));

		eventBus.on("initialSetupUser", function(user) {
			if (!this.config) {
				return;
			}
			this.config.users = [user];
			eventBus.trigger("initialSetupNext");
		}.bind(this));

		eventBus.on("initialSetupNext", function() {
			if (!this.config) {
				return;
			}
			if (!this.config.mount_dirs || !this.config.mount_dirs.length) {
				riot.mount("#initial-setup-page", "initial-setup-mount");
			} else if (!this.config.users || !this.config.users.length) {
				riot.mount("#initial-setup-page", "initial-setup-user");
			} else {
				riot.mount("#initial-setup-page", "initial-setup-finish");
				this.commit()
				.then(function(res) {
					setTimeout(this.login.bind(this), 2000);
				}.bind(this));
			}
		}.bind(this));

		commit(final) {
			var data = new FormData();
			data.append("config", JSON.stringify(this.config));
			return fetch("api/settings/",
				{	method: "PUT"
				,	credentials: "same-origin"
				,	body: data
				}
			)
			.then(function(res) {
				if (!res.ok) {
					console.log("Error while applying settings");
				}
				return res;
			});
		}

		login() {
			var username = this.config.users[0].name;
			var password = this.config.users[0].password;
			utils.tryLogin(username, password)
			.then(function(res) {
				route("browse", null, true);
			})
			.catch(function(res) {
				console.log("Error while signing in");
			});
		}
	</script>

	<style>
		.setupContainer {
			width: 50%;
			height: 100%;
			display: flex;
			flex-wrap: nowrap;
			justify-content: stretch;
			align-items: flex-start;
			align-content: flex-start;

			margin: auto;
			padding-top: 10%;
			box-sizing: border-box;
		}

		#initial-setup-page {
			flex-grow: 1;
			flex-shrink: 1;
			border-right: 2px solid #44C8F1;
			padding-left: 40px;
			padding-right: 40px;
		}

		.logo {
			width: 15%;
			padding-top: 10px;
			padding-right: 40px;
			flex-grow: 0;
			flex-shrink: 0;
		}

		img {
			width: 100%;
		}
	</style>
</initial-setup>
