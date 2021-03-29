import { createRouter } from 'vue-router'

import Store from "/src/store/store"
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

const routes = [
	{
		path: '/welcome',
		component: { render: k => k(InitialSetup) },
		meta: { requiresInitialSetupIncomplete: true },
	},
	{
		path: '/auth',
		component: { render: k => k(Auth) },
		meta: { requiresAnonymous: true, requiresInitialSetupComplete: true },
	},
	{
		path: '',
		component: { render: k => k(App) },
		meta: { requiresAuth: true, requiresInitialSetupComplete: true },
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

const router = createRouter({ routes });

router.beforeEach((to, from, next) => {
	const isLoggedIn = Store.getters['user/isLoggedIn'];
	const isInitialSetupComplete = Store.getters['initialSetup/isComplete'];

	// Re-route to initial-setup if needed
	if (to.matched.some(record => record.meta.requiresInitialSetupComplete)) {
		if (!isInitialSetupComplete) {
			return next('/welcome');
		}
	}

	// Re-route to auth if needed
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!isLoggedIn) {
			return next('/auth');
		}
	}

	// Re-route away from initial-setup if complete
	if (to.matched.some(record => record.meta.requiresInitialSetupIncomplete)) {
		if (isInitialSetupComplete) {
			return next('/');
		}
	}

	// Re-route away from auth if logged in
	if (to.matched.some(record => record.meta.requiresAnonymous)) {
		if (isLoggedIn) {
			return next('/');
		}
	}

	// Default entry-point
	if (to.path == "/") {
		return next('/browse');
	}

	next();
})

export default router;
