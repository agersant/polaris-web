import API from '/src/api'

const state = {
	isComplete: false,
}

const getters = {
	isComplete: state => state.isComplete,
}

const actions = {
	refresh({ commit }) {
		return API.initialSetup().then(state => {
			commit("setIsComplete", state.has_any_users);
		});
	}
}

const mutations = {
	setIsComplete(state, newIsComplete) {
		state.isComplete = newIsComplete;
	},
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
