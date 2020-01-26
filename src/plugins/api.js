import Router from "/src/router"
import Store from "/src/store/store"

export const API = {
	request(endpoint, options) {
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
	}
}

const APIPlugin = {
	install(Vue) {
		Vue.prototype.$api = API;
	}
}

export default APIPlugin;
