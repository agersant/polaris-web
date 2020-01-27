import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './components/app'
import Auth from './components/auth'
import NotFound from './components/not-found'
import Browser from './components/collection/browser'
import Playlist from './components/collection/playlist/playlist'
import Playlists from './components/collection/playlist/playlists'
import Random from './components/collection/random'
import Recent from './components/collection/recent'
import Search from './components/collection/search/search'
import InitialSetup from './components/initial-setup/initial-setup'
import Settings from './components/settings/settings'
import SettingsCollection from './components/settings/sections/collection'
import SettingsDDNS from './components/settings/sections/ddns'
import SettingsPreferences from './components/settings/sections/preferences'
import SettingsUsers from './components/settings/sections/users'

Vue.use(VueRouter)

const routes = [
	{ path: '/welcome', component: { render: k => k(InitialSetup) } },
	{ path: '/auth', component: { render: k => k(Auth) } },
	{
		path: '',
		component: { render: k => k(App) },
		children: [
			{ path: '/browse*', component: { render: k => k(Browser) } },
			{ path: '/random', component: { render: k => k(Random) } },
			{ path: '/recent', component: { render: k => k(Recent) } },
			{ path: '/playlists', component: { render: k => k(Playlists) } },
			{ path: '/playlist/*', component: { render: k => k(Playlist) } },
			{ path: '/search*', component: { render: k => k(Search) } },
			{
				path: '/settings', component: { render: k => k(Settings) }, children: [
					{ path: 'collection', component: { render: k => k(SettingsCollection) } },
					{ path: 'ddns', component: { render: k => k(SettingsDDNS) } },
					{ path: 'users', component: { render: k => k(SettingsUsers) } },
					{ path: '*', component: { render: k => k(SettingsPreferences) } }
				]
			},
			{ path: '*', component: { render: k => k(NotFound) } }
		]
	},
]

export default new VueRouter({ routes });
