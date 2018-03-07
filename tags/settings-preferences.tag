<settings-preferences>


	<form if={ preferences } onsubmit={ save }>
		<p class="explanation">Polaris can automatically submit songs you play to <a href="https://www.last.fm/" target="_blank">Last.fm</a>.</p>
		<div class="field">
			<label for="lastfm_username">Last.fm username</label><input type="text" id="lastfm_username" oninput={ onUsernameInput } value={ preferences.lastfm_username } />
			<p class="tip">The username you use to login to Last.fm.</p>
		</div>
		<div class="field">
			<label for="lastfm_password">Last.fm password</label><input type="password" id="lastfm_password" oninput={ onPasswordInput } value={ preferences.lastfm_password }/>
			<p class="tip">The password you use to login to Last.fm.</p>
		</div>
		<settings-apply onclick={ save }/>
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
