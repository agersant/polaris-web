import Router from "/src/router"

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
	}
}

const APIPlugin = {
	install(Vue) {
		Vue.prototype.$api = API;
	}
}

export default APIPlugin;
