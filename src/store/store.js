import Vue from 'vue'
import Vuex from 'vuex'
import Playlist from './modules/playlist'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		playlist: Playlist,
	},
	strict: debug,
})
