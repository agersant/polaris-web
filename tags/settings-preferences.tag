<settings-preferences>


	<form if={ preferences } onsubmit={ save }>
		<div class="field">
			<label for="lastfm_username">Last.fm scrobbling</label>
			<div if={ preferences.lastfm_username }>
				<p class="explanation">You are scrobbling music as <a href="https://www.last.fm/user/{preferences.lastfm_username}" target="_blank">{ preferences.lastfm_username }</a>.</p>
				<button onclick={ unlinkLastFMAccount }>Unlink Last.fm account</button>
			</div>
			<div if={ !preferences.lastfm_username }>
			<p class="explanation">Polaris can automatically submit songs you play to <a href="https://www.last.fm/" target="_blank">Last.fm</a>.</p>
				<button onclick={ linkLastFMAccount }>Link Last.fm account</button>
			</div>
		</div>
	</form>

	<script>

		var self = this;
		this.preferences = null;

		this.on('mount', function() {
			this.refreshPreferences();
		}.bind(self));

		onUsernameInput(e) {
			this.preferences.lastfm_username = e.target.value;
		}

		onPasswordInput(e) {
			this.preferences.lastfm_password = e.target.value;
		}

		refreshPreferences() {
			fetch("api/preferences/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.preferences = data;
				this.update();
			}.bind(self));
		}

		linkLastFMAccount(e) {
			var apiKey = "02b96c939a2b451c31dfd67add1f696e";
			var currentURL = new URL(window.location.href);
			var username = Cookies.get("username");
			var successPopupContent = btoa(
				`<!doctype html>
				<html>
					<head>
						<title>Polaris</title>
						<meta charset="UTF-8">
					</head>
					<body>
						<script type="text/javascript">
							window.opener.postMessage("polaris-lastfm-auth-success", "*");
						<\/script>
					</body>
				</html>`
			);
			var callbackURL = currentURL.protocol + "//" + currentURL.host + "/api/lastfm/link?content=" + encodeURIComponent(successPopupContent);
			var url = "https://www.last.fm/api/auth/?api_key=" + apiKey + "&cb=" + encodeURIComponent(callbackURL);
			var windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
			var lastFMPopup = window.open(url, "Link Last.fm account", windowFeatures);
			window.addEventListener("message", function(event) {
				if (event.source != lastFMPopup) {
					return;
				}
				if (event.data == "polaris-lastfm-auth-success")
				{
					lastFMPopup.close();
					this.refreshPreferences();
				}
			}.bind(self), false);
		}

		unlinkLastFMAccount(e) {
			fetch("api/lastfm/link", { credentials: "same-origin", method: "DELETE" })
			.then(function(res) {
				this.refreshPreferences();
			}.bind(self));
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
