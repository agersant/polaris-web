import Router from "/src/router"
import Store from "/src/store/store"

let decodeItems = function(items) {
	let decoded = [];
	for (const item of items) {
		decoded.push({
			fields: item.Directory || item.Song,
			variant: item.Directory ? "Directory" : "Song",
		});
	}
	return decoded;
}

let request = function(endpoint, options) {
	if (!options) {
		options = {};
	}
	options.credentials = "same-origin";
	return fetch("api" + endpoint, options)
		.then(res => {
			if (res.status == 401) {
				Router.push("/auth").catch(err => { });
				throw "Authentication error";
			}
			return res;
		});
}

export default {
	makeAudioURL(path) {
		return "api/audio/" + encodeURIComponent(path);
	},

	makeThumbnailURL(path) {
		return "api/thumbnail/" + encodeURIComponent(path) + "?pad=false";
	},

	initialSetup() {
		return request('/initial_setup')
			.then(res => res.json());
	},

	login(username, password) {
		return fetch("api/auth", {
			method: "POST",
			body: JSON.stringify({ username: username, password: password }),
			headers: {
				"Content-type": "application/json",
			},
			credentials: 'same-origin',
		}).then(res => {
			if (res.status == 200) {
				Store.commit("playlist/loadFromDisk");
				Router.push("/browse").catch(err => { });
			}
			return res;
		});
	},

	users() {
		return request("/users")
			.then(res => res.json());
	},

	createUser(name, password, isAdmin) {
		return request("/user", {
			method: "POST",
			body: JSON.stringify({ name: name, password: password, admin: isAdmin }),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	updateUser(name, password, isAdmin) {
		return request("/user/" + name, {
			method: "PUT",
			body: JSON.stringify({ new_password: password, new_is_admin: isAdmin }),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	deleteUser(name) {
		return request("/user/" + name, { method: "DELETE", });
	},

	getPreferences() {
		return request("/preferences")
			.then(res => res.json());
	},

	putPreferences(preferences) {
		return request("/preferences", {
			method: "PUT",
			body: JSON.stringify(preferences),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	getSettings() {
		return request("/settings")
			.then(res => res.json());
	},

	putSettings(settings) {
		return request("/settings", {
			method: "PUT",
			body: JSON.stringify(settings),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	getMountDirs() {
		return request("/mount_dirs")
			.then(res => res.json());
	},

	putMountDirs(mountDirs) {
		return request("/mount_dirs", {
			method: "PUT",
			body: JSON.stringify(mountDirs),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	getDDNSConfig() {
		return request("/ddns")
			.then(res => res.json());
	},

	putDDNSConfig(config) {
		return request("/ddns", {
			method: "PUT",
			body: JSON.stringify(config),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	triggerIndex() {
		return request("/trigger_index", { method: "POST" });
	},

	browse(path) {
		return request("/browse/" + encodeURIComponent(path))
			.then(res => res.json())
			.then(decodeItems);
	},

	flatten(path) {
		return request("/flatten/" + encodeURIComponent(path))
			.then(res => res.json());
	},

	random() {
		return request("/random")
			.then(res => res.json());
	},

	recent() {
		return request("/recent")
			.then(res => res.json());
	},

	search(query) {
		return request("/search/" + encodeURIComponent(query))
			.then(res => res.json())
			.then(decodeItems);
	},

	playlists() {
		return request("/playlists")
			.then(res => res.json());
	},

	getPlaylist(name) {
		return request("/playlist/" + encodeURIComponent(name))
			.then(res => res.json());
	},

	putPlaylist(name, tracks) {
		let playlist = { tracks: tracks };
		return request("/playlist/" + encodeURIComponent(name), {
			method: "PUT",
			body: JSON.stringify(playlist),
			headers: {
				"Content-Type": "application/json"
			}
		});
	},

	deletePlaylist(name) {
		return request("/playlist/" + encodeURIComponent(name), { method: "DELETE" });
	},

	lastFMNowPlaying(path) {
		return request("/lastfm/now_playing/" + encodeURIComponent(path), { method: "PUT" });
	},

	lastFMScrobble(path) {
		return request("/lastfm/scrobble/" + encodeURIComponent(path), { method: "POST" });
	},

	lastFMUnlink() {
		return request("/lastfm/link", { method: "DELETE" });
	},
}
