import * as Utils from '/src/utils'

const state = {
	name: null,
	tracks: [],
	currentTrack: null,
	playbackOrder: "default"
}

const getters = {}

const actions = {
	queueDirectory({ commit, state }, path) {
		let url = "/flatten/" + encodeURIComponent(path);
		Utils.api(url)
			.then(res => res.json())
			.then(data => {
				let length = data.length;
				// TODO remove this loop, do in-place where it's needed
				for (let i = 0; i < length; i++) {
					data[i].url = "api/serve/" + encodeURIComponent(data[i].path);
					if (data[i].album && data[i].artwork) {
						data[i].artworkURL = "api/serve/" + encodeURIComponent(data[i].artwork);
					}
				}
				commit('queueTracks', data);
			});
	},
}

const mutations = {

	clear(state) {
		state.tracks = [];
		state.name = null;
		// saveLocalPlaylist TODO
	},

	queueTracks(state, tracks) {
		state.tracks = state.tracks.concat(tracks.map(t => { return { info: t } }));
		// saveLocalPlaylist TODO
	},

	setPlaybackOrder(state, order) {
		state.playbackOrder = order;
		// saveLocalPlaylist TODO
	},

	play(state, track) {
		this.currentTrack = track;
		// saveLocalPlaylist TODO
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}