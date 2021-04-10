import { createStore } from 'vuex'
import InitialSetup from './modules/initial-setup'
import MountDirs from './modules/mount-dirs'
import Playlist from './modules/playlist'
import Playlists from './modules/playlists'
import User from './modules/user'
import Users from './modules/users'

const debug = process.env.NODE_ENV !== 'production'

export default store = createStore({
	modules: {
		initialSetup: InitialSetup,
		mountDirs: MountDirs,
		playlist: Playlist,
		playlists: Playlists,
		user: User,
		users: Users,
	},
	strict: debug,
})
