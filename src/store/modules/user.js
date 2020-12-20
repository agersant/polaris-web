import API from '/src/api'

const STORAGE_USERNAME = 'username'
const STORAGE_AUTH_TOKEN = 'authToken'
const STORAGE_IS_ADMIN = 'isAdmin'

const state = {
	name: localStorage.getItem(STORAGE_USERNAME),
	authToken: localStorage.getItem(STORAGE_AUTH_TOKEN),
	isAdmin: localStorage.getItem(STORAGE_IS_ADMIN),
}

const getters = {
	isLoggedIn: state => !!state.authToken,
	getAuthToken: state => state.authToken,
}

const actions = {
	login({ commit }, { username, password }) {
		return API.login(username, password).then(authorization => {
			commit("login", {
				username: authorization.username,
				authToken: authorization.token,
				isAdmin: authorization.is_admin
			});
			const payload = null;
			commit("playlist/loadFromDisk", payload, { root: true });
			// TODO load preferences (for theme)
		});
	},

	logout({ commit }) {
		commit("logout");
	}
}

const mutations = {
	login(state, { username, authToken, isAdmin }) {
		localStorage[STORAGE_USERNAME] = username;
		localStorage[STORAGE_AUTH_TOKEN] = authToken;
		localStorage[STORAGE_IS_ADMIN] = isAdmin;
		state.name = username;
		state.authToken = authToken;
		state.isAdmin = isAdmin;
	},

	logout(state) {
		localStorage.removeItem(STORAGE_USERNAME);
		localStorage.removeItem(STORAGE_AUTH_TOKEN);
		localStorage.removeItem(STORAGE_IS_ADMIN);
		state.name = null;
		state.authToken = null;
		state.isAdmin = null;
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
