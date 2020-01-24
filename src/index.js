import Vue from 'vue'
import VueRouter from 'vue-router'
import Cookies from 'js-cookie'

import * as Utils from './utils'
import Auth from './components/auth'
import App from './components/app'
import Browser from './components/collection/browser'
import Discography from './components/collection/layout/discography'
import Explorer from './components/collection/layout/explorer'
import Playlists from './components/playlists'
import Sidebar from './components/sidebar'

Vue.use(VueRouter)

const routes = [
	// { path: '/welcome', component: { template: '<initial-setup/>' } },
	{
		path: '/auth', component: { template: '<auth></auth>' }
	},
	{
		path: '',
		component: { template: '<app></app>' },
		children: [
			{ path: '/playlists', component: { template: '<playlists></playlists>' } },
			{ path: '/browse*', component: { template: '<browser></browser>' } },
			{ path: '*', component: { template: '<browser></browser>' } }
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
		Vue.component('discography', Discography);
		Vue.component('explorer', Explorer);
		Vue.component('playlists', Playlists);
		Vue.component('sidebar', Sidebar);

		new Vue({
			router,
		}).$mount('#vue-container')

		if (!data.has_any_users) {
			router.push('welcome').catch(err => { });
		} else if (Cookies.get('username') == undefined) {
			router.push('auth').catch(err => { });
		}
	});