<auth>
	<div class="authForm">
		<div class="content">
			<img class="logo" src="img/logo.png"/>
			<form name="authForm" onsubmit={ doLogin }>
				<input type="text" name="username" placeholder="Username" autofocus/>
				<input type="password" name="password" placeholder="Password"/>
				<p if={ badCredentials } class="tip error">Incorrect credentials, please try again.</p>
				<input type="submit" value="Login"/>
			</form>
		</div>
	</div>

	<script>
		doLogin(e) {
			e.preventDefault();
			var form = document.forms["authForm"];
			var username = encodeURIComponent(form.elements["username"].value);
			var password = encodeURIComponent(form.elements["password"].value);
			this.badCredentials = false;
			utils.tryLogin(username, password)
			.then(function(res) {
				route("browse", null, true);
			})
			.catch(function(status){
				if (status == 401) {
					this.badCredentials = true;
					this.update();
				}
			}.bind(this));
		}
	</script>

	<style>

		.authForm {
			height: 100%;
			margin: auto;
			width: 25%;
		}

		.logo {
			width: 100%;
			margin-bottom: 70px;
		}

		.content {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: stretch;
			height: 90%;
		}

		form {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: stretch;
		}

		input {
			width: inherit;
			display: block;
			margin: 5px 0;
			font-size: 1.5rem;
		}

		input[type="submit"] {
			align-self: flex-end;
			font-size: 1.25rem;
			margin-top: 15px;
		}

		input[type="text"], input[type="password"], .tip {
			padding-left: 10px;
		}

		input[type="text"], input[type="password"] {
			border: 0;
			box-sizing: content-box;
			border-bottom: 1px solid #AAA; 
		}

		.tip {
			/*Exclude from layout so the form doesn't move when this appears*/
			height: 0;
			overflow: visible;
		}
	</style>

</auth>