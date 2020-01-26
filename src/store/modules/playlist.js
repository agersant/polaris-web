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

	removeTrack(state, track) {
		var trackIndex = state.tracks.indexOf(track);
		if (trackIndex >= 0) {
			state.tracks.splice(trackIndex, 1);
		}
		// this.saveLocalPlaylist(); TODO
	},

	setPlaybackOrder(state, order) {
		state.playbackOrder = order;
		// utils.saveUserData("playbackOrder", playbackOrder); TODO
	},

	play(state, track) {
		state.currentTrack = track;
		// saveLocalPlaylist TODO
	},

	advance(state, delta) {
		const playbackOrder = state.playbackOrder;
		const tracks = state.tracks;
		const numTracks = tracks.length;
		const currentTrack = state.currentTrack;

		let newTrack = null;
		if (numTracks > 0) {
			if (playbackOrder == "random") {
				const newTrackIndex = Math.floor(Math.random() * numTracks);
				newTrack = tracks[newTrackIndex];
			} else if (playbackOrder == "repeat-track") {
				newTrack = currentTrack;
			} else {
				const currentTrackIndex = tracks.indexOf(currentTrack);
				if (currentTrackIndex < 0) {
					newTrack = tracks[0];
				} else {
					const newTrackIndex = currentTrackIndex + delta;
					if (newTrackIndex >= 0 && newTrackIndex < numTracks) {
						newTrack = tracks[newTrackIndex];
					} else if (playbackOrder == "repeat-all") {
						if (delta > 0) {
							newTrack = tracks[0];
						} else {
							newTrack = tracks[numTracks - 1];
						}
					}
				}
			}
		}

		if (newTrack != null) {
			state.currentTrack = newTrack;
		}
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}