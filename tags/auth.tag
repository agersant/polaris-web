<auth>
	<form name="authForm" onsubmit={ doLogin }>
		<input type="text" name="username">
		<input type="password" name="password">
		<input type="submit" value="Login">
	</form>

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
</auth>