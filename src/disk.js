import Store from "/src/store/store"

export default {

	save(key, value) {
		const username = Store.getters['user/name'];
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
	},

	load(key) {
		const username = Store.getters['user/name'];
		if (!username) {
			return;
		}
		let value = localStorage[username + "." + key];
		if (value && value[0] == "[") {
			value = JSON.parse(value);
		}
		return value;
	}
}
