import Vue from 'vue'
import Cookies from 'js-cookie'

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
import API from "./plugins/api"
import Router from "./router"
import Store from "./store/store"


Vue.use(API)

Vue.prototype.$api.request('/initial_setup')
	.then(res => res.json())
	.then(data => {

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
			store: Store,
			router: Router,
		}).$mount('#vue-container')

		if (!data.has_any_users) {
			router.push('/welcome').catch(err => { });
		} else if (Cookies.get('username') == undefined) {
			router.push('/auth').catch(err => { });
		}
	});
