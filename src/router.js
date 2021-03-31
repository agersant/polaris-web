import { createRouter, createWebHashHistory  } from 'vue-router'

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

const extractVFSPath = route => {
	const path = (route.params.pathMatch || []).join("/") + (route.hash || "");
	return {path};
};

const extractSearchQuery = route => {
	const query = (route.params.pathMatch || []).join("/") + (route.hash || "");
	return {query};
};

const routes = [
	{
		path: '/welcome',
		component: InitialSetup,
		meta: { requiresInitialSetupIncomplete: true },
	},
	{
		path: '/auth',
		component: Auth,
		meta: { requiresAnonymous: true, requiresInitialSetupComplete: true },
	},
	{
		path: '',
		component: App,
		meta: { requiresAuth: true, requiresInitialSetupComplete: true },
		children: [
			{ path: '/browse/:pathMatch(.*)*', component: Browser, props: extractVFSPath},
			{ path: '/random', component: Random },
			{ path: '/recent', component: Recent },
			{ path: '/playlists', component: Playlists },
			{ path: '/playlist/:pathMatch(.*)*', component: Playlist },
			{ path: '/search/:pathMatch(.*)*', component: Search, props: extractSearchQuery},
			{
				path: '/settings', component: Settings, children: [
					{ path: 'collection', component: SettingsCollection },
					{ path: 'ddns', component: SettingsDDNS },
					{ path: 'users', component: SettingsUsers },
					{ path: ':pathMatch(.*)*', component: SettingsPreferences }
				]
			},
			{ path: ':pathMatch(.*)', component: NotFound }
		]
	},
]

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

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
