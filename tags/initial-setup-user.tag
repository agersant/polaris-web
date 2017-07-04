<initial-setup-user>
	<h2>User Account</h2>
	<p class="explanation">Please choose a username and a password you would like to use to sign in to Polaris.</p>
	<form onsubmit={ proceed }>
		<div class="field">
			<label for="username">Username</label>
			<input id="username" type="text" value={ opts.name } oninput={ onUsernameInput }/>
		</div>

		<div class="field">
			<label for="password">New password</label>
			<input type="password" id="password" value={ opts.password } oninput={ onPasswordInput }/>
			<p if={ !opts.password } class="tip error">The password cannot be blank.</p>
		</div>

		<div class="field">
			<label for="password_confirm">Confirm new password</label>
			<input type="password" id="password_confirm" value={ opts.password_confirm } oninput={ onPasswordConfirmInput }/>
			<p if={ opts.password && opts.password_confirm && opts.password !== opts.password_confirm } class="tip error">The passwords do not match.</p>
		</div>
		<button class="submit" disabled={ !validate() } onclick={ proceed }>Next</button>
	</form>
	<script>
		validate() {
			return this.opts.name && this.opts.password && this.opts.password === this.opts.password_confirm;
		}

		onUsernameInput(e) {
			this.opts.name = e.target.value;
		}

		onPasswordInput(e) {
			this.opts.password = e.target.value;
		}

		onPasswordConfirmInput(e) {
			this.opts.password_confirm = e.target.value;
		}

		proceed(e) {
			e.preventDefault();
			eventBus.trigger("initialSetupUser", {
				name: this.opts.name,
				password: this.opts.password,
				admin: true,
			});
		}
	</script>
</initial-setup-user>