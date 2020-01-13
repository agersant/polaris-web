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
		});
	}

	var api = function(endpoint, options) {
		if (!options) {
			options = {};
		}
		options.credentials = "same-origin";
		return fetch("api" + endpoint, options)
			.then((res) => {
				if (res.status == 401) {
					route("auth", null, true);
					throw "Authentication error";
				}
				return res;
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
		api: api,
		getPathTail: getPathTail,
		stripFileExtension: stripFileExtension,
	}

})();
