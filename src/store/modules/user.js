import API from '/src/api'
import * as Theming from '/src/theming/theming'

const STORAGE_USERNAME = 'username'
const STORAGE_AUTH_TOKEN = 'authToken'
const STORAGE_IS_ADMIN = 'isAdmin'

const state = {
	name: localStorage.getItem(STORAGE_USERNAME),
	authToken: localStorage.getItem(STORAGE_AUTH_TOKEN),
	isAdmin: localStorage.getItem(STORAGE_IS_ADMIN),
	lastFMUsername: null,
	themeBase: null,
	themeAccent: null,
	themeBasePreview: null,
	themeAccentPreview: null,
}

const getters = {
	isLoggedIn: state => !!state.authToken,
	authToken: state => state.authToken,
	lastFMUsername: state => state.lastFMUsername,
	themeBase: state => state.themeBasePreview || state.themeBase || Theming.getDefaultBase(),
	themeAccent: state => state.themeAccentPreview || state.themeAccent || Theming.getDefaultAccent(),
}

const actions = {
	login({ commit, dispatch }, { username, password }) {
		return API.login(username, password).then(authorization => {
			commit("login", {
				username: authorization.username,
				authToken: authorization.token,
				isAdmin: authorization.is_admin
			});
			const payload = null;
			commit("playlist/loadFromDisk", payload, { root: true });
			return dispatch("refreshPreferences");
		});
	},

	logout({ commit }) {
		commit("logout");
	},

	refreshPreferences({ commit }) {
		return API.getPreferences().then(preferences => {
			commit("setPreferences", preferences)
		});
	},

	saveTheme({ dispatch }) {
		let themeBase = this.getters["user/themeBase"];
		let themeAccent = this.getters["user/themeAccent"];
		return API.putPreferences(themeBase, themeAccent).then(() => {
			dispatch("refreshPreferences")
		});
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
		state.themeBase = null;
		state.themeAccent = null;
		state.themeAccentPreview = null;
	},

	logout(state) {
		localStorage.removeItem(STORAGE_USERNAME);
		localStorage.removeItem(STORAGE_AUTH_TOKEN);
		localStorage.removeItem(STORAGE_IS_ADMIN);
		state.name = null;
		state.authToken = null;
		state.isAdmin = null;
		state.themeBase = null;
		state.themeAccent = null;
		state.themeAccentPreview = null;
	},

	setPreferences(state, preferences) {
		state.lastFMUsername = preferences.lastFMUsername;
		state.themeBase = preferences.themeBase;
		state.themeAccent = preferences.themeAccent;
	},

	previewThemeBase(state, themeBase) {
		state.themeBasePreview = themeBase;
	},

	previewThemeAccent(state, themeAccent) {
		state.themeAccentPreview = themeAccent;
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
