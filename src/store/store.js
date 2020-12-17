import Vue from 'vue'
import Vuex from 'vuex'
import Playlist from './modules/playlist'
import Playlists from './modules/playlists'
import Users from './modules/users'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		playlist: Playlist,
		playlists: Playlists,
		users: Users,
	},
	strict: debug,
})
