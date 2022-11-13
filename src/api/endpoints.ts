import Router from "@/router";
import {
	Authorization,
	CollectionItem,
	CollectionItemRaw,
	DDNSConfig,
	Directory,
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
	User,
	UserUpdate,
} from "@/api/dto";
import { useUserStore } from "@/stores/user";

function decodeCollectionItem(data: CollectionItemRaw): CollectionItem {
	if (data.Song) {
		data.Song.variant = "Song";
		return data.Song;
	}
	if (data.Directory) {
		data.Directory.variant = "Directory";
		return data.Directory;
	}
	throw "invalid collection item";
}

function decodeDirectory(data: Directory): Directory {
	data.variant = "Directory";
	return data;
}

function decodeSong(data: Song): Song {
	data.variant = "Song";
	return data;
}

async function request(endpoint: string, options?: RequestInit): Promise<Response> {
	const user = useUserStore();

	if (!options) {
		options = {};
	}

	options.headers = new Headers(options.headers);
	if (user.isLoggedIn) {
		options.headers.set("Authorization", "Bearer " + getAuthToken());
	}

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

export async function browse(path: string): Promise<CollectionItem[]> {
	const response = await request("/browse/" + encodeURIComponent(path));
	const rawItems: CollectionItemRaw[] = await response.json();
	return rawItems.map(decodeCollectionItem);
}

export async function flatten(path: string): Promise<Song[]> {
	const response = await request("/flatten/" + encodeURIComponent(path));
	return (await response.json()).map(decodeSong);
}

export async function random(): Promise<Directory[]> {
	const response = await request("/random");
	return (await response.json()).map(decodeDirectory);
}

export async function recent(): Promise<Directory[]> {
	const response = await request("/recent");
	return (await response.json()).map(decodeDirectory);
}

export async function search(query: string): Promise<CollectionItem[]> {
	const response = await request("/search/" + encodeURIComponent(query));
	const rawItems: CollectionItemRaw[] = await response.json();
	return rawItems.map(decodeCollectionItem);
}

export async function playlists(): Promise<ListPlaylistsEntry[]> {
	return (await request("/playlists")).json();
}

export async function getPlaylist(name: string): Promise<Song[]> {
	const response = await request("/playlist/" + encodeURIComponent(name));
	return (await response.json()).map(decodeSong);
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
