<settings-ddns>

	<p class="explanation">Polaris can automatically broadcast your computer's IP to YDNS to make your server reachable at a fixed URL. You will need to sign up for a <a href="https://ydns.io/" target="_blank">YDNS</a> account before filling out the corresponding settings on this page. If you prefer not to use YDNS, you can ignore these settings and set up any another dynamic DNS service manually.</p>

	<form if={ ydns } onsubmit={ save }>
		<div class="field">
			<label for="host">Hostname</label><input type="text" id="host" value={ ydns.host } oninput={ onHostInput } placeholder="yourname.ydns.eu"/>
			<p class="tip">The URL pointing to your Polaris server.</p>
		</div>
		<div class="field">
			<label for="username">Username</label><input type="text" id="username" oninput={ onUsernameInput } value={ ydns.username } />
			<p class="tip">You can find this on the YDNS website under <span class="code">Preferences > API</span>.</p>
		</div>
		<div class="field">
			<label for="password">Password</label><input type="password" id="password" oninput={ onPasswordInput } value={ ydns.password }/>
			<p class="tip">You can find this on the YDNS website under <span class="code">Preferences > API</span>.</p>
		</div>
		<settings-apply onclick={ save }/>
	</form>

	<script>

		var self = this;
		this.config = null;
		this.ydns = null;

		this.on('mount', function() {
			fetch("api/settings/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.config = data;
				this.ydns = data.ydns;
				this.update();
			}.bind(self));
		});

		onHostInput(e) {
			this.ydns.host = e.target.value;
		}

		onUsernameInput(e) {
			this.ydns.username = e.target.value;
		}

		onPasswordInput(e) {
			this.ydns.password = e.target.value;
		}

		save(e) {
			e.preventDefault();
			eventBus.trigger("settings:submit", this.config);
		}
	</script>

	<style>
		a {
			text-decoration: underline;
			color: #44C8F1;
		}

		.code {
			font-family: "Courier New","sans-serif";
			color: inherit;
		}
	</style>
</settings-ddns>
