import * as Utils from '/src/utils'
import { API } from '/src/plugins/api'

const state = {
	name: null,
	tracks: [],
	currentTrack: null,
	playbackOrder: "default"
}

const getters = {}

const actions = {
	clear({ commit, dispatch }) {
		commit("clear");
		dispatch("saveToDisk");
	},

	removeTrack({ commit, dispatch }, track) {
		commit("removeTrack", track);
		dispatch("saveToDisk");
	},

	setPlaybackOrder({ commit, dispatch }, order) {
		commit("setPlaybackOrder", order);
		dispatch("saveToDisk");
	},

	play({ commit, dispatch }, track) {
		commit("play", track);
		dispatch("saveToDisk");
	},

	next({ commit, dispatch }) {
		commit("advance", 1);
		dispatch("saveToDisk");
	},

	previous({ commit, dispatch }) {
		commit("advance", -1);
		dispatch("saveToDisk");
	},

	queueDirectory({ commit, dispatch }, path) {
		let url = "/flatten/" + encodeURIComponent(path);
		API.request(url)
			.then(res => res.json())
			.then(data => {
				commit("queueTracks", data);
				dispatch("saveToDisk");
			});
	},

	saveToDisk() {
		if (Utils.saveUserData("playlist", state.tracks)) {
			Utils.saveUserData("playlistName", state.name);
			let currentTrackIndex = state.tracks.indexOf(state.currentTrack);
			Utils.saveUserData("currentTrackIndex", currentTrackIndex);
		}
	}
}

const mutations = {

	clear(state) {
		state.tracks = [];
		state.name = null;
	},

	queueTracks(state, tracks) {
		state.tracks = state.tracks.concat(tracks.map(t => { return { info: t } }));
		if (!state.currentTrack && state.tracks.length > 0) {
			state.currentTrack = state.tracks[0];
		}
	},

	removeTrack(state, track) {
		var trackIndex = state.tracks.indexOf(track);
		if (trackIndex >= 0) {
			state.tracks.splice(trackIndex, 1);
		}
	},

	setPlaybackOrder(state, order) {
		state.playbackOrder = order;
	},

	play(state, track) {
		state.currentTrack = track;
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
	},

	loadFromDisk(state) {
		let playbackOrder = Utils.loadUserData("playbackOrder");
		if (playbackOrder) {
			state.playbackOrder = playbackOrder;
		}
		let tracks = Utils.loadUserData("playlist");
		if (tracks) {
			state.tracks = tracks;
		}
		let currentTrackIndex = Utils.loadUserData("currentTrackIndex");
		if (currentTrackIndex && currentTrackIndex >= 0 && currentTrackIndex < state.tracks.length) {
			state.currentTrack = state.tracks[currentTrackIndex];
		}
		state.name = Utils.loadUserData("playlistName");
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}