import API from '/src/api'

const state = {
	listing: [],
}

const getters = {}

const actions = {
	refresh({ commit }) {
		return API.getMountDirs().then(mountDirs => {
			commit("setMountDirs", mountDirs);
		});
	},

	set({ dispatch }, mountDirs) {
		return API.putMountDirs(mountDirs).then(() => {
			dispatch("refresh");
		});
	},
}

const mutations = {
	setMountDirs(state, mountDirs) {
		state.listing = mountDirs;
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
