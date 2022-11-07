import { createRouter, createWebHashHistory, RouteLocation, RouteLocationMatched } from "vue-router";

import App from "@/components/App.vue";
import Auth from "@/components/Auth.vue";
import NotFound from "@/components/NotFound.vue";
import Browser from "@/components/collection/Browser.vue";
import Playlist from "@/components/collection/playlist/Playlist.vue";
import Playlists from "@/components/collection/playlist/Playlists.vue";
import Random from "@/components/collection/Random.vue";
import Recent from "@/components/collection/Recent.vue";
import Search from "@/components/collection/search/Search.vue";
import InitialSetup from "@/components/initial-setup/InitialSetup.vue";
import Settings from "@/components/settings/Settings.vue";
import SettingsCollection from "@/components/settings/sections/Collection.vue";
import SettingsDDNS from "@/components/settings/sections/DDNS.vue";
import SettingsPreferences from "@/components/settings/sections/Preferences.vue";
import SettingsUsers from "@/components/settings/sections/Users.vue";
import { useUserStore } from "@/stores/user";
import { useInitialSetupStore } from "@/stores/initial-setup";

function extractVFSPath(route: RouteLocation) {
	let pathMatchParam = route.params.pathMatch;
	let pathMatch: string[];
	if (Array.isArray(pathMatchParam)) {
		pathMatch = pathMatchParam;
	} else {
		pathMatch = [pathMatchParam];
	}
	const path = (pathMatch || []).join("/") + (route.hash || "");
	return { path };
}

const routes = [
	{
		path: "/welcome",
		component: InitialSetup,
		meta: { requiresInitialSetupIncomplete: true },
	},
	{
		path: "/auth",
		component: Auth,
		meta: { requiresAnonymous: true, requiresInitialSetupComplete: true },
	},
	{
		path: "",
		component: App,
		meta: { requiresAuth: true, requiresInitialSetupComplete: true },
		children: [
			{ path: "/browse/:pathMatch(.*)*", component: Browser, props: extractVFSPath },
			{ path: "/random", component: Random },
			{ path: "/recent", component: Recent },
			{ path: "/playlists", component: Playlists },
			{ path: "/playlist/:name", component: Playlist, props: true },
			{ path: "/search/:query?", component: Search, props: true },
			{
				path: "/settings",
				component: Settings,
				children: [
					{ path: "collection", component: SettingsCollection },
					{ path: "ddns", component: SettingsDDNS },
					{ path: "users", component: SettingsUsers },
					{ path: ":pathMatch(.*)*", component: SettingsPreferences },
				],
			},
			{ path: ":pathMatch(.*)", component: NotFound },
		],
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

router.beforeEach(async (to, from, next) => {
	const initialSetup = useInitialSetupStore();

	if (!initialSetup.isStateKnown) {
		await initialSetup.refresh();
	}

	const isLoggedIn = useUserStore().isLoggedIn;
	const isInitialSetupComplete = initialSetup.isComplete;

	// Re-route to initial-setup if needed
	if (to.matched.some(record => record.meta.requiresInitialSetupComplete)) {
		if (!isInitialSetupComplete) {
			return next("/welcome");
		}
	}

	// Re-route to auth if needed
	if (to.matched.some(record => record.meta.requiresAuth)) {
		if (!isLoggedIn) {
			return next("/auth");
		}
	}

	// Re-route away from initial-setup if complete
	if (to.matched.some(record => record.meta.requiresInitialSetupIncomplete)) {
		if (isInitialSetupComplete) {
			return next("/");
		}
	}

	// Re-route away from auth if logged in
	if (to.matched.some(record => record.meta.requiresAnonymous)) {
		if (isLoggedIn) {
			return next("/");
		}
	}

	// Default entry-point
	if (to.path == "/") {
		return next("/browse");
	}

	next();
});

export default router;
