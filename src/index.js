import Vue from 'vue'
import VueRouter from 'vue-router'
import Cookies from 'js-cookie'

import * as Utils from './utils'
import App from './components/app'
import Auth from './components/auth'
import Browser from './components/collection/browser'
import Random from './components/collection/random'
import Playlists from './components/collection/playlists'
import Recent from './components/collection/recent'
import InitialSetup from './components/initial-setup/initial-setup'
import Settings from './components/settings/settings'
import SettingsCollection from './components/settings/sections/collection'
import SettingsDDNS from './components/settings/sections/ddns'
import SettingsPreferences from './components/settings/sections/preferences'
import SettingsUsers from './components/settings/sections/users'
import store from "./store/store"

Vue.use(VueRouter)

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

const router = new VueRouter({ routes });

Utils.api('/initial_setup')
	.then(function(res) { return res.json(); })
	.then(function(data) {

		Vue.component('auth', Auth);
		Vue.component('app', App);
		Vue.component('browser', Browser);
		Vue.component('initial-setup', InitialSetup);
		Vue.component('playlists', Playlists);
		Vue.component('recent', Recent);
		Vue.component('random', Random);

		Vue.component('settings', Settings);
		Vue.component('collection', SettingsCollection);
		Vue.component('ddns', SettingsDDNS);
		Vue.component('preferences', SettingsPreferences);
		Vue.component('users', SettingsUsers);

		new Vue({
			store,
			router,
		}).$mount('#vue-container')

		if (!data.has_any_users) {
			router.push('/welcome').catch(err => { });
		} else if (Cookies.get('username') == undefined) {
			router.push('/auth').catch(err => { });
		}
	});