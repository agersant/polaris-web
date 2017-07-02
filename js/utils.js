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

	return {
		saveUserData: saveUserData,
		loadUserData: loadUserData,
	} 

})();
