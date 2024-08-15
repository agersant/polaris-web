import { createRouter, createWebHashHistory, RouteLocation, RouteLocationMatched } from "vue-router";

import App from "@/components/App.vue";
import Auth from "@/components/Auth.vue";
import NotFound from "@/components/NotFound.vue";
import AlbumPage from "@/components/library/AlbumPage.vue";
import Files from "@/components/library/Files.vue";
import Playlist from "@/components/profile/playlists/Playlist.vue";
import Playlists from "@/components/profile/playlists/Playlists.vue";
import Random from "@/components/library/Random.vue";
import Recent from "@/components/library/Recent.vue";
// import Search from "@/components/library/Search.vue";
import InitialSetup from "@/components/initial-setup/InitialSetup.vue";
import Settings from "@/components/profile/settings/Settings.vue";
import SettingsCollection from "@/components/profile/settings/Collection.vue";
import SettingsDDNS from "@/components/profile/settings/DDNS.vue";
import SettingsPreferences from "@/components/profile/settings/Preferences.vue";
import SettingsUsers from "@/components/profile/settings/Users.vue";
import { useUserStore } from "@/stores/user";
import { useInitialSetupStore } from "@/stores/initial-setup";

export const URI_ARRAY_SEPARATOR = " ⨯ ";

function extractAlbumKey(route: RouteLocation) {
	let artists: string[] = [];
	if (!Array.isArray(route.params.artists)) {
		artists = route.params.artists.split(URI_ARRAY_SEPARATOR);
	}
	return {
		album_key: {
			artists,
			name: route.params.name,
		}
	};
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
			{ path: "/files", component: Files },
			{ path: "/artists/:artists/albums/:name", component: AlbumPage, props: extractAlbumKey },
			{ path: "/random", component: Random },
			{ path: "/recent", component: Recent },
			{ path: "/playlists", component: Playlists },
			{ path: "/playlist/:name", component: Playlist, props: true },
			// { path: "/search/:query?", component: Search, props: true },
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
		return next("/files");
	}

	next();
});

export default router;
