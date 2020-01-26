import Vue from 'vue'
import VueRouter from 'vue-router'

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

export default new VueRouter({ routes });
