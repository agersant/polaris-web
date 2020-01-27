import Vue from 'vue'
import VueRouter from 'vue-router'

import App from './components/app'
import Auth from './components/auth'
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

Vue.component('auth', Auth);
Vue.component('app', App);
Vue.component('browser', Browser);
Vue.component('initial-setup', InitialSetup);
Vue.component('playlist', Playlist);
Vue.component('playlists', Playlists);
Vue.component('random', Random);
Vue.component('recent', Recent);
Vue.component('search', Search);

Vue.component('settings', Settings);
Vue.component('collection', SettingsCollection);
Vue.component('ddns', SettingsDDNS);
Vue.component('preferences', SettingsPreferences);
Vue.component('users', SettingsUsers);

const routes = [
	{ path: '/welcome', component: { template: '<initial-setup></initial-setup>' } },
	{
		path: '/auth', component: { template: '<auth></auth>' }
	},
	{
		path: '',
		component: { template: '<app></app>' },
		children: [
			{ path: '/browse*', component: { template: '<browser></browser>' } },
			{ path: '/random', component: { template: '<random></random>' } },
			{ path: '/recent', component: { template: '<recent></recent>' } },
			{ path: '/playlists', component: { template: '<playlists></playlists>' } },
			{ path: '/playlist/*', component: { template: '<playlist></playlist>' } },
			{ path: '/search*', component: { template: '<search></search>' } },
			{
				path: '/settings', component: { template: '<settings></settings>' }, children: [
					{ path: 'collection', component: { template: '<collection></collection>' } },
					{ path: 'ddns', component: { template: '<ddns></ddns>' } },
					{ path: 'users', component: { template: '<users></users>' } },
					{ path: '*', component: { template: '<preferences></preferences>' } }
				]
			},
			{ path: '*', component: { template: '<browser></browser>' } } // TODO 404
		]
	},
]

export default new VueRouter({ routes });
