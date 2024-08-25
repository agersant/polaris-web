import {
	Album,
	AlbumHeader,
	AlbumKey,
	API_ARRAY_SEPARATOR,
	Authorization,
	BrowserEntry,
	DDNSConfig,
	InitialSetup,
	LastFMLinkToken,
	ListPlaylistsEntry,
	MountDir,
	NewSettings,
	NewUser,
	Preferences,
	SavePlaylistInput,
	Settings,
	Song,
	SongList,
	User,
	UserUpdate,
} from "@/api/dto";
import { useSongsStore } from "@/stores/songs";
import { useUserStore } from "@/stores/user";

async function request(endpoint: string, options?: RequestInit): Promise<Response> {
	const user = useUserStore();

	if (!options) {
		options = {};
	}

	options.headers = new Headers(options.headers);
	if (user.isLoggedIn) {
		options.headers.set("Authorization", "Bearer " + getAuthToken());
	}
	options.headers.set("Accept-Version", "8")

	const response = await fetch("api" + endpoint, options);
	if (response.status == 401) {
		user.logout();
		throw response;
	}

	return response;
}

function getAuthToken(): string | null {
	return useUserStore().authToken;
}

export function makeAudioURL(path: string) {
	return "api/audio/" + encodeURIComponent(path) + "?auth_token=" + getAuthToken();
}

export function makeThumbnailURL(path: string) {
	return "api/thumbnail/" + encodeURIComponent(path) + "?pad=false&auth_token=" + getAuthToken();
}

export async function initialSetup(): Promise<InitialSetup> {
	return (await request("/initial_setup")).json();
}

export async function login(username: string, password: string): Promise<Authorization> {
	const response = await request("/auth", {
		method: "POST",
		body: JSON.stringify({ username: username, password: password }),
		headers: {
			"Content-type": "application/json",
		},
	});
	return response.json();
}

export async function users(): Promise<User[]> {
	return (await request("/users")).json();
}

export async function createUser(newUser: NewUser): Promise<void> {
	await request("/user", {
		method: "POST",
		body: JSON.stringify(newUser),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function updateUser(name: string, userUpdate: UserUpdate): Promise<Response> {
	return await request("/user/" + name, {
		method: "PUT",
		body: JSON.stringify(userUpdate),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function deleteUser(name: string) {
	await request("/user/" + name, { method: "DELETE" });
}

export async function getPreferences(): Promise<Preferences> {
	return (await request("/preferences")).json();
}

export async function putPreferences(theme: string, accentColor: string): Promise<void> {
	const preferences: Preferences = {
		web_theme_base: theme,
		web_theme_accent: accentColor,
	};
	await request("/preferences", {
		method: "PUT",
		body: JSON.stringify(preferences),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function getSettings(): Promise<Settings> {
	return (await request("/settings")).json();
}

export async function putSettings(settings: NewSettings): Promise<void> {
	await request("/settings", {
		method: "PUT",
		body: JSON.stringify(settings),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function getMountDirs(): Promise<MountDir[]> {
	return (await request("/mount_dirs")).json();
}

export async function putMountDirs(mountDirs: MountDir[]): Promise<Response> {
	return await request("/mount_dirs", {
		method: "PUT",
		body: JSON.stringify(mountDirs),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function getDDNSConfig(): Promise<DDNSConfig> {
	return (await request("/ddns")).json();
}

export async function putDDNSConfig(config: DDNSConfig) {
	return request("/ddns", {
		method: "PUT",
		body: JSON.stringify(config),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function triggerIndex(): Promise<Response> {
	return await request("/trigger_index", { method: "POST" });
}

export async function browse(path: string): Promise<BrowserEntry[]> {
	const response = await request("/browse/" + encodeURIComponent(path));
	return await response.json();
}

export async function flatten(path: string): Promise<SongList> {
	const songs = useSongsStore();
	const response = await request("/flatten/" + encodeURIComponent(path));

	const songList = response.json().then((l: SongList) => {
		songs.ingest(l.first_songs);
		return l;
	});

	return await songList;
}

export async function get_album(album_key: AlbumKey): Promise<Album> {
	const response = await request("/artists/" + encodeURIComponent(album_key.artists.join(API_ARRAY_SEPARATOR)) + "/albums/" + encodeURIComponent(album_key.name || ""));
	return await response.json();
}

export async function random(): Promise<AlbumHeader[]> {
	const response = await request("/random");
	return await response.json();
}

export async function recent(): Promise<AlbumHeader[]> {
	const response = await request("/recent");
	return await response.json();
}

export async function search(query: string): Promise<BrowserEntry[]> {
	const response = await request("/search/" + encodeURIComponent(query));
	return await response.json();
}

export async function playlists(): Promise<ListPlaylistsEntry[]> {
	return (await request("/playlists")).json();
}

export async function getPlaylist(name: string): Promise<SongList> {
	const response = await request("/playlist/" + encodeURIComponent(name));
	return await response.json();
}

export async function putPlaylist(name: string, tracks: string[]): Promise<Response> {
	let playlist: SavePlaylistInput = { tracks: tracks };
	return await request("/playlist/" + encodeURIComponent(name), {
		method: "PUT",
		body: JSON.stringify(playlist),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export async function deletePlaylist(name: string): Promise<void> {
	await request("/playlist/" + encodeURIComponent(name), { method: "DELETE" });
}

export async function lastFMNowPlaying(path: string): Promise<void> {
	await request("/lastfm/now_playing/" + encodeURIComponent(path), { method: "PUT" });
}

export async function lastFMScrobble(path: string): Promise<void> {
	await request("/lastfm/scrobble/" + encodeURIComponent(path), { method: "POST" });
}

export async function lastFMGetLinkToken(): Promise<string> {
	const response = await request("/lastfm/link_token/");
	const token: LastFMLinkToken = await response.json();
	return token.value;
}

export async function lastFMUnlink(): Promise<void> {
	await request("/lastfm/link", { method: "DELETE" });
}
