var utils = (function() {

	var saveUserData = function(key, value) {
		var username = Cookies.get("username");
		if (!username) {
			return;
		}
		if (typeof value == "object") {
			value = JSON.stringify(value);
		}
		try {
			localStorage[username + "." + key] = value;
			return true;
		} catch(e) {
			console.log("Could not write to local storage: " + key);
			return false;
		}
	}

	var loadUserData = function(key) {
		var username = Cookies.get("username");
		if (!username) {
			return;
		}
		var value = localStorage[username + "." + key];
		if (value && value[0] == "[") {
			value = JSON.parse(value);
		}
		return value;
	}

	var tryLogin = function(username, password) {
		return fetch("/api/auth", {
			method: "POST",
			body: "username=" + username + "&password=" + password,
			headers: {
				"Content-type": "application/x-www-form-urlencoded",
			},
			credentials: 'same-origin',
		})
		.then(function(res) {
			if (res.status == 200) {
				Cookies.set("username", username);
				return Promise.all([res.json(), res])
			}
			throw res.status;
		})
		.then(function(res) {
			var body = res[0];
			Cookies.set("admin", body.admin);
			return res[1];
		});
	}

	return {
		saveUserData: saveUserData,
		loadUserData: loadUserData,
		tryLogin: tryLogin,
	} 

})();
