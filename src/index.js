import Vue from 'vue'
import VueRouter from 'vue-router'
import Cookies from 'js-cookie'

import * as Utils from './utils'
import Auth from './components/auth'
import App from './components/app'

Vue.use(VueRouter)

const routes = [
	// { path: '/welcome', component: { template: '<initial-setup/>' } },
	{ path: '/auth', component: { template: '<auth/>' } },
	{ path: '*', component: { template: '<app/>' } },
]

const router = new VueRouter({ routes });

Utils.api('/initial_setup')
	.then(function(res) { return res.json(); })
	.then(function(data) {

		Vue.component('auth', Auth);
		Vue.component('app', App);

		new Vue({
			router,
		}).$mount('#vue-container')

		if (!data.has_any_users) {
			router.push('welcome').catch(err => { });
		} else if (Cookies.get('username') == undefined) {
			router.push('auth').catch(err => { });
		}
	});