<auth>
	<div class="authForm">
		<form name="authForm" onsubmit={ doLogin }>
			<input type="text" name="username" placeholder="Username">
			<input type="password" name="password" placeholder="Password">
			<input type="submit" value="Login">
		</form>
	</div>

	<script>
		doLogin() {
			var form = document.forms["authForm"];
			var username = encodeURIComponent(form.elements["username"].value);
			var password = encodeURIComponent(form.elements["password"].value);
			fetch("/api/auth", {
				method: "POST",
				body: "username=" + username + "&password=" + password,
				headers: {
					"Content-type": "application/x-www-form-urlencoded",
				},
				credentials: 'same-origin',
			})
			.then(function(res) {
				if (Cookies.get("username") != undefined) {
					riot.route("/");
				}
			});
		}
	</script>

	<style>

		.authForm {
			height: 100%;
			margin: auto;
			width: 25%;
		}

		.authForm form {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: stretch;
			height: 90%;
		}

		.authForm input {
			display: block;
			margin: 10px 0;
			font-size: 2em;
		}

		.authForm input[type="submit"] {
			width: 20%;
			align-self: flex-end;
			border: none;
			color: #FFF;
			background-color: #13D5FF;
			border-radius: 5px;
			font-size: 1.5em;
		}

		.authForm input[type="text"], .authForm input[type="password"] {
			border: 0;
			padding-left: 10px;
			box-sizing: content-box;
			border-bottom: 1px solid #BBB; 
		}
		
	</style>

</auth>