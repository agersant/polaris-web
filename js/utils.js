var utils = (function() {

	var getFileExtension = function(file) {
		var regex = /\.([0-9a-z]+)$/i;
		var matches = regex.exec(file);
		if (matches) {
			return matches[1];
		}
		return null;
	};

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
		getFileExtension: getFileExtension,
		saveUserData: saveUserData,
		loadUserData: loadUserData,
	} 

})();
