import { createRouter, createWebHashHistory, RouteLocation, RouteLocationMatched } from "vue-router";

import { Song } from "@/api/dto";
import App from "@/components/App.vue";
import Auth from "@/components/Auth.vue";
import NotFound from "@/components/NotFound.vue";
import Album from "@/components/library/Album.vue";
import Albums from "@/components/library/Albums.vue";
import Artist from "@/components/library/Artist.vue";
import Artists from "@/components/library/Artists.vue";
import Files from "@/components/library/Files.vue";
import Search from "@/components/library/Search.vue";
// import Playlist from "@/components/profile/playlists/Playlist.vue";
import Playlists from "@/components/profile/playlists/Playlists.vue";
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
		albumKey: {
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
			{ path: "/artists", component: Artists },
			{ path: "/artists/:name", component: Artist, props: true },
			{ path: "/albums", component: Albums },
			{ path: "/albums/:artists/:name", component: Album, props: extractAlbumKey },
			{ path: "/playlists", component: Playlists },
			// { path: "/playlist/:name", component: Playlist, props: true },
			{ path: "/search", component: Search },
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

export function makeArtistURL(name: string) {
	// TODO this breaks when artists or album name contains `/`, `? or `&`
	return `/artists/${name}`;
};

export function makeAlbumURL(artists: string[], name: string) {
	// TODO this breaks when artists or album name contains `/`, `? or `&`
	return `/albums/${(artists || []).join(URI_ARRAY_SEPARATOR)}/${name}`;
}

export function makeAlbumURLFromSong(song: Song) {
	if (!song.album) {
		return undefined;
	}
	let artists = song.artists;
	if (song.album_artists?.length) {
		artists = song.album_artists;
	}
	if (!artists?.length) {
		return undefined;
	}
	return makeAlbumURL(artists, song.album);
};

export default router;
