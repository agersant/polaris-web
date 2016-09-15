<auth>
	<form name="authForm" onsubmit={ doLogin }>
		<input type="text" name="username">
		<input type="password" name="password">
		<input type="submit" value="Login">
	</form>

	<script>
		doLogin() {
			var form = document.forms.namedItem("authForm");
			var formData = new FormData(form);
			var username = encodeURIComponent(formData.get("username"));
			var password = encodeURIComponent(formData.get("password"));
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