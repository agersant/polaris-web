var utils = (function() {

	var saveUserData = function(key, value) {
		var username = Cookies.get("username");
		if (!username) {
			return;
		}
		if (value == null || value == undefined) {
			localStorage.removeItem(username + "." + key);
			return true;
		}
		if (typeof value == "object") {
			value = JSON.stringify(value);
		}
		try {
			localStorage[username + "." + key] = value;
			return true;
		} catch (e) {
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
		return fetch("api/auth", {
			method: "POST",
			body: JSON.stringify({ username: username, password: password }),
			headers: {
				"Content-type": "application/json",
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

	var getPathTail = function(path) {
		if (!path) {
			return null;
		}
		path = path.replace(/\\/g, "/");
		var slices = path.split("/");
		slices = slices.filter(s => s.length > 0);
		return slices[slices.length - 1] || "";
	}

	var stripFileExtension = function(path) {
		if (!path) {
			return null;
		}
		return path.replace(/\.[^/.]+$/, "");
	}

	return {
		saveUserData: saveUserData,
		loadUserData: loadUserData,
		tryLogin: tryLogin,
		getPathTail: getPathTail,
		stripFileExtension: stripFileExtension,
	}

})();
