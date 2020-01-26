import Cookies from 'js-cookie'

export function saveUserData(key, value) {
	let username = Cookies.get("username");
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

export function loadUserData(key) {
	let username = Cookies.get("username");
	if (!username) {
		return;
	}
	let value = localStorage[username + "." + key];
	if (value && value[0] == "[") {
		value = JSON.parse(value);
	}
	return value;
}

export function tryLogin(username, password) {
	return fetch("api/auth", {
		method: "POST",
		body: JSON.stringify({ username: username, password: password }),
		headers: {
			"Content-type": "application/json",
		},
		credentials: 'same-origin',
	});
}

export function getPathTail(path) {
	if (!path) {
		return null;
	}
	path = path.replace(/\\/g, "/");
	var slices = path.split("/");
	slices = slices.filter(s => s.length > 0);
	return slices[slices.length - 1] || "";
}

export function stripFileExtension(path) {
	if (!path) {
		return null;
	}
	return path.replace(/\.[^/.]+$/, "");
}