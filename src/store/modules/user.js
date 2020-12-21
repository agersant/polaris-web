import API from '/src/api'
import * as Theming from '/src/theming/theming'

const STORAGE_USERNAME = 'username'
const STORAGE_AUTH_TOKEN = 'authToken'
const STORAGE_IS_ADMIN = 'isAdmin'

const reset = (state) => {
	state.name = localStorage.getItem(STORAGE_USERNAME);
	state.authToken = localStorage.getItem(STORAGE_AUTH_TOKEN);
	state.isAdmin = localStorage.getItem(STORAGE_IS_ADMIN) == 'true';
	state.lastFMUsername = null;
	state.themeBase = null;
	state.themeAccent = null;
	state.themeBasePreview = null;
	state.themeAccentPreview = null;
	return state;
}

const state = reset({});

const getters = {
	isLoggedIn: state => !!state.authToken,
	isAdmin: state => state.isAdmin,
	name: state => state.name,
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
	},

	linkLastFM({ dispatch }) {

		API.lastFMGetLinkToken().then(linkToken => {
			const apiKey = "02b96c939a2b451c31dfd67add1f696e";
			const currentURL = new URL(window.location.href);
			const successPopupContent = btoa(
				`<!doctype html>
				<html>
					<head>
						<title>Polaris</title>
						<meta charset="UTF-8">
					</head>
					<body>
						<script type="text/javascript">
							window.opener.postMessage("polaris-lastfm-auth-success", "*");
						<\/script>
					</body>
				</html>`
			);

			let callbackURL = currentURL.protocol + "//" + currentURL.host + "/api/lastfm/link?content=" + encodeURIComponent(successPopupContent) + "&auth_token=" + linkToken;
			let url = "https://www.last.fm/api/auth/?api_key=" + apiKey + "&cb=" + encodeURIComponent(callbackURL);
			let windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
			let lastFMPopup = window.open(url, "Link Last.fm account", windowFeatures);
			window.addEventListener(
				"message",
				event => {
					if (event.source != lastFMPopup) {
						return;
					}
					if (event.data == "polaris-lastfm-auth-success") {
						lastFMPopup.close();
						dispatch("refreshPreferences");
					}
				},
				false
			);
		});

	},

	unlinkLastFM({ dispatch }) {
		API.lastFMUnlink().then(() => dispatch("refreshPreferences"));
	}
}

const mutations = {
	login(state, { username, authToken, isAdmin }) {
		localStorage[STORAGE_USERNAME] = username;
		localStorage[STORAGE_AUTH_TOKEN] = authToken;
		localStorage[STORAGE_IS_ADMIN] = isAdmin;
		reset(state);
	},

	logout(state) {
		localStorage.removeItem(STORAGE_USERNAME);
		localStorage.removeItem(STORAGE_AUTH_TOKEN);
		localStorage.removeItem(STORAGE_IS_ADMIN);
		reset(state);
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
