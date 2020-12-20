import API from '/src/api'

const state = {
	listing: [],
}

const getters = {}

const actions = {
	refresh({ commit }) {
		return API.users().then(users => {
			commit("setUsers", users);
		});
	},

	create({ dispatch }, newUser) {
		return API.createUser(newUser.name, newUser.password, newUser.isAdmin).then(() => {
			if (state.listing.length > 0) {
				return dispatch("refresh");
			} else {
				const credentials = { username: newUser.name, password: newUser.password };
				return dispatch("user/login", credentials, { root: true })
					.then(() => dispatch("refresh"))
					.then(() => dispatch("initialSetup/refresh", null, { root: true }));
			}
		});
	},

	update({ dispatch }, { username, newPassword, newIsAdmin }) {
		return API.updateUser(username, newPassword, newIsAdmin).then(res => {
			dispatch("refresh");
			return res;
		});
	},

	delete({ dispatch }, name) {
		return API.deleteUser(name).then(() => {
			dispatch("refresh");
		});
	}
}

const mutations = {
	setUsers(state, users) {
		state.listing = users;
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
