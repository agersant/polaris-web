<settings-ddns>

	<p class="explanation">Polaris can automatically broadcast your computer's IP to YDNS to make your server reachable at a fixed URL. You will need to sign up for a <a href="https://ydns.io/" target="_blank">YDNS</a> account before filling out the corresponding settings on this page. If you prefer not to use YDNS, you can ignore these settings and set up any another dynamic DNS service manually.</p>

	<form>
		<div class="field">
			<label for="host">Hostname</label><input type="text" name="host" placeholder="http://yourname.ydns.eu"/>
			<p class="tip">The URL pointing to your Polaris server.</p>
		</div>
		<div class="field">
			<label for="username">Username</label><input type="text" name="username"/>
			<p class="tip">You can find this on the YDNS website under <span class="code">Preferences > API</span>.</p>
		</div>
		<div class="field">
			<label for="password">Password</label><input type="text" name="password"/>
			<p class="tip">You can find this on the YDNS website under <span class="code">Preferences > API</span>.</p>
		</div>
		<input type="submit" value="Apply"/>
	</form>

	<style>
		a {
			text-decoration: underline;
			color: #44C8F1;
		}

		.field {
			margin-bottom: 25px;
		}

		label {
			display: block;
			font-weight: 400;
			margin-bottom: 2px;
		}

		input {
			display: block;
			width: 50%;
			padding: 4px;
			padding-left: 8px;
			padding-right: 8px;
			margin-bottom: 5px;
			border: 1px solid #AAA;
			border-radius: 3px;
			font-size: 0.875rem;
		}

		input[type="submit"] {
			width: inherit;
			margin-bottom: 0;
		}

		.explanation {
			text-align: justify;
			margin-bottom: 20px;
			line-height: 1.25;
		}

		.code {
			font-family: "Courier New","sans-serif";
			color: inherit;
		}

		.tip {
			width: 50%;
			font-size: 0.8125rem;
			color: #999;
		}
	</style>
</settings-ddns>
