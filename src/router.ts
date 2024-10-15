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
import Genre from "@/components/library/Genre.vue";
import GenreAlbums from "@/components/library/GenreAlbums.vue";
import GenreArtists from "@/components/library/GenreArtists.vue";
import GenreOverview from "@/components/library/GenreOverview.vue";
import Genres from "@/components/library/Genres.vue";
import Playlist from "@/components/library/Playlist.vue";
import Playlists from "@/components/library/Playlists.vue";
import Search from "@/components/library/Search.vue";
import SongDetails from "@/components/library/SongDetails.vue";
import InitialSetup from "@/components/initial-setup/InitialSetup.vue";
import Settings from "@/components/settings/Settings.vue";
import SettingsCollection from "@/components/settings/Collection.vue";
import SettingsDDNS from "@/components/settings/DDNS.vue";
import SettingsPreferences from "@/components/settings/Preferences.vue";
import SettingsUsers from "@/components/settings/Users.vue";
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

function extractVirtualPath(route: RouteLocation) {
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
			{ path: "/files", component: Files },
			{ path: "/genres", component: Genres },
			{
				path: "/genres/:name", component: Genre, props: true, children: [
					{ path: "", component: GenreOverview },
					{ path: "albums", component: GenreAlbums },
					{ path: "artists", component: GenreArtists },
				],
			},
			{ path: "/artists", component: Artists },
			{ path: "/artists/:name", component: Artist, props: true },
			{ path: "/albums", component: Albums },
			{ path: "/albums/:artists/:name", component: Album, props: extractAlbumKey },
			{ path: "/playlists", component: Playlists },
			{ path: "/playlists/:name", component: Playlist, props: true },
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
			{ path: "/songs/:pathMatch(.*)*", component: SongDetails, props: extractVirtualPath },
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

export function makeSongURL(path: string) {
	return `/songs/${encodeURIComponent(path)}`;
};

export function makeGenreURL(name: string) {
	return `/genres/${encodeURIComponent(name)}`;
};

export function makeArtistURL(name: string) {
	return `/artists/${encodeURIComponent(name)}`;
};

export function makeAlbumURL(artists: string[], name: string) {
	const artistsComponent = encodeURIComponent((artists || []).join(URI_ARRAY_SEPARATOR));
	const nameComponent = encodeURIComponent(name);
	return `/albums/${artistsComponent}/${nameComponent}`;
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
