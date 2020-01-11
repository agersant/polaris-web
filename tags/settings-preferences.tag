<settings-preferences>


	<form if={ preferences } onsubmit={ save }>
		<div class="field">
			<label>Theme</label>
			<table>
				<thead>
					<th>Mode</th>
					<th>Color</th>
					<th/>
				</thead>
				<tr>
					<td>
						<select ref="base" onchange={ onThemeSelected }>
							<option each={ theme in theming.listBases() } value={ theme.id } selected={ theming.getCurrentTheme() == theme.id } no-reorder>{ theme.name } </option>
						</select>
					</td>
					<td class="accent-color">
						<input ref="accent" type="color" value={ theming.getCurrentAccentColor() } oninput={ onAccentPreview } onchange={ onAccentSelected }>
					</td>
					<td><i onClick={ resetTheme } class="noselect material-icons md-18">restore</i></td>
				</tr>
			</table>
		</div>
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

		onThemeSelected(e) {
			this.preferences.web_theme_base = e.target.value;
			theming.setBase(this.preferences.web_theme_base);
			this.save(e);
		}

		onAccentPreview(e) {
			this.preferences.web_theme_accent = e.target.value;
			theming.setAccentColor(this.preferences.web_theme_accent);
		}

		onAccentSelected(e) {
			this.preferences.web_theme_accent = e.target.value;
			theming.setAccentColor(this.preferences.web_theme_accent);
			this.save(e);
		}

		resetTheme(e) {
			this.preferences.web_theme_base = null;
			this.preferences.web_theme_accent = null;
			theming.setBase(this.preferences.web_theme_base);
			theming.setAccentColor(this.preferences.web_theme_accent);
			this.update();
			this.save(e);
		}

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
			color: var(--theme-accent);
		}

		td.accent-color {
			background-color: var(--theme-accent)
		}

		input[type="color"] {
			opacity: 0;
		}
	</style>
</settings-preferences>
