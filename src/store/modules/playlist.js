import API from '/src/API'
import Disk from '/src/disk'

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

	setName({ commit, dispatch }, name) {
		commit("setName", name);
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
		if (Disk.save("playlist", state.tracks)) {
			Disk.save("playlistName", state.name);
			let currentTrackIndex = state.tracks.indexOf(state.currentTrack);
			Disk.save("currentTrackIndex", currentTrackIndex);
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

	setName(state, name) {
		state.name = name;
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
		let playbackOrder = Disk.load("playbackOrder");
		if (playbackOrder) {
			state.playbackOrder = playbackOrder;
		}
		let tracks = Disk.load("playlist");
		if (tracks) {
			state.tracks = tracks;
		}
		let currentTrackIndex = Disk.load("currentTrackIndex");
		if (currentTrackIndex && currentTrackIndex >= 0 && currentTrackIndex < state.tracks.length) {
			state.currentTrack = state.tracks[currentTrackIndex];
		}
		state.name = Disk.load("playlistName");
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}