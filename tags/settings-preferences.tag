<settings-preferences>


	<form if={ preferences } onsubmit={ save }>
		<p class="explanation">Polaris can automatically submit songs you play to <a href="https://www.last.fm/" target="_blank">Last.fm</a>.</p>
		<div class="field">
			<label for="lastfm_username">Last.fm integration</label>
			<button onclick={ linkLastFMAccount }>Link account</button>
		</div>
	</form>

	<script>

		var self = this;
		this.preferences = null;

		this.on('mount', function() {
			fetch("api/preferences/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.preferences = data;
				this.update();
			}.bind(self));
		});

		onUsernameInput(e) {
			this.preferences.lastfm_username = e.target.value;
		}

		onPasswordInput(e) {
			this.preferences.lastfm_password = e.target.value;
		}

		linkLastFMAccount(e) {
			var apiKey = "02b96c939a2b451c31dfd67add1f696e";
			var currentURL = new URL(window.location.href);
			var username = Cookies.get("username");
			var callbackURL = currentURL.protocol + "//" + currentURL.host + "/api/lastfm/auth?username=" + username;
			var url = "https://www.last.fm/api/auth/?api_key=" + apiKey + "&cb=" + callbackURL;
			console.log("callbackURL " + callbackURL);
			console.log("url " + url);
			var windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
			window.open(url, "Link Last.fm account", windowFeatures);
		}

		save(e) {
			e.preventDefault();
			eventBus.trigger("settings:submitPreferences", this.preferences);
		}
	</script>

	<style>
		a {
			text-decoration: underline;
			color: #44C8F1;
		}
	</style>
</settings-preferences>
