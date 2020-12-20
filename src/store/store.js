import Vue from 'vue'
import Vuex from 'vuex'
import MountDirs from './modules/mount-dirs'
import Playlist from './modules/playlist'
import Playlists from './modules/playlists'
import User from './modules/user'
import Users from './modules/users'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	modules: {
		mountDirs: MountDirs,
		playlist: Playlist,
		playlists: Playlists,
		user: User,
		users: Users,
	},
	strict: debug,
})
