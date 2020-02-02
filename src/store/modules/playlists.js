import API from '/src/api'

const state = {
	listing: []
}

const getters = {}

const actions = {
	refresh({ commit }) {
		API.playlists().then(playlists => {
			commit("setPlaylists", playlists);
		});
	}
}

const mutations = {
	setPlaylists(state, playlists) {
		state.listing = playlists;
	},
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
