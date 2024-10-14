import {
	Album,
	AlbumHeader,
	AlbumKey,
	API_ARRAY_SEPARATOR,
	Artist,
	ArtistHeader,
	Authorization,
	BrowserEntry,
	Genre,
	GenreHeader,
	IndexStatus,
	InitialSetup,
	MountDir,
	NewSettings,
	NewUser,
	Peaks,
	Playlist,
	PlaylistHeader,
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

function getAuthToken(): string | undefined {
	return useUserStore().authToken;
}

// Basic

export async function initialSetup(): Promise<InitialSetup> {
	return (await request("/initial_setup")).json();
}

export async function login(username: string, password: string): Promise<Authorization> {
	const response = await request("/auth", {
		method: "POST",
		body: JSON.stringify({ username: username, password: password }),
		headers: { "Content-type": "application/json" },
	});
	return response.json();
}

// Config

export async function getSettings(): Promise<Settings> {
	return (await request("/settings")).json();
}

export async function putSettings(settings: NewSettings): Promise<void> {
	await request("/settings", {
		method: "PUT",
		body: JSON.stringify(settings),
		headers: { "Content-Type": "application/json" },
	});
}

export async function getMountDirs(): Promise<MountDir[]> {
	return (await request("/mount_dirs")).json();
}

export async function putMountDirs(mountDirs: MountDir[]): Promise<Response> {
	return await request("/mount_dirs", {
		method: "PUT",
		body: JSON.stringify(mountDirs),
		headers: { "Content-Type": "application/json" },
	});
}

export async function triggerIndex(): Promise<Response> {
	return await request("/trigger_index", { method: "POST" });
}

export async function getIndexStatus(): Promise<IndexStatus> {
	return (await request("/index_status")).json();
}

// Users

export async function getUsers(): Promise<User[]> {
	return (await request("/users")).json();
}

export async function createUser(newUser: NewUser): Promise<void> {
	await request("/user", {
		method: "POST",
		body: JSON.stringify(newUser),
		headers: { "Content-Type": "application/json" },
	});
}

export async function updateUser(name: string, userUpdate: UserUpdate): Promise<Response> {
	return await request("/user/" + name, {
		method: "PUT",
		body: JSON.stringify(userUpdate),
		headers: { "Content-Type": "application/json" },
	});
}

export async function deleteUser(name: string) {
	await request("/user/" + name, { method: "DELETE" });
}

// File browser

export async function browse(path: string): Promise<BrowserEntry[]> {
	const songs = useSongsStore();
	const response = await request("/browse/" + encodeURIComponent(path));
	return await response.json().then((entries: BrowserEntry[]) => {
		songs.request(entries.filter(e => !e.is_directory).map(e => e.path));
		return entries;
	});
}

export async function flatten(path: string): Promise<SongList> {
	const songs = useSongsStore();
	const response = await request("/flatten/" + encodeURIComponent(path));

	const songList = response.json().then((list: SongList) => {
		songs.ingest(list.first_songs);
		songs.request(list.paths);
		return list;
	});

	return await songList;
}

// Semantic

export async function getGenres(): Promise<GenreHeader[]> {
	const response = await request("/genres");
	return await response.json();
}

export async function getGenre(name: string): Promise<Genre> {
	const response = await request(`/genres/${encodeURIComponent(name)}`);
	return await response.json();
}

export async function getGenreAlbums(name: string): Promise<AlbumHeader[]> {
	const response = await request(`/genres/${encodeURIComponent(name)}/albums`);
	return await response.json();
}

export async function getGenreArtists(name: string): Promise<ArtistHeader[]> {
	const response = await request(`/genres/${encodeURIComponent(name)}/artists`);
	return await response.json();
}

export async function getGenreSongs(genre: string): Promise<SongList> {
	const songs = useSongsStore();
	const response = await request(`/genres/${encodeURIComponent(genre)}/songs`);
	const songList = response.json().then((list: SongList) => {
		songs.ingest(list.first_songs);
		songs.request(list.paths);
		return list;
	});
	return await songList;
}

export async function getAlbums(): Promise<AlbumHeader[]> {
	const response = await request("/albums");
	return await response.json();
}

export async function getRandomAlbums(seed: number, offset: number, count: number): Promise<AlbumHeader[]> {
	const response = await request(`/albums/random?seed=${seed}&offset=${offset}&count=${count}`);
	return await response.json();
}

export async function getRecentAlbums(offset: number, count: number): Promise<AlbumHeader[]> {
	const response = await request(`/albums/recent?offset=${offset}&count=${count}`);
	return await response.json();
}

export async function getArtists(): Promise<ArtistHeader[]> {
	const response = await request("/artists");
	return await response.json();
}

export async function getArtist(name: string): Promise<Artist> {
	const response = await request(`/artists/${encodeURIComponent(name)}`);
	return await response.json();
}

export async function getAlbum(albumKey: AlbumKey): Promise<Album> {
	const songs = useSongsStore();
	const response = await request("/artists/" + encodeURIComponent(albumKey.artists.join(API_ARRAY_SEPARATOR)) + "/albums/" + encodeURIComponent(albumKey.name || ""));
	return await response.json().then((album: Album) => {
		songs.ingest(album.songs);
		return album;
	});
}

// Search

export async function search(query: string): Promise<SongList> {
	const songs = useSongsStore();
	const response = await request("/search/" + encodeURIComponent(query));

	const songList = response.json().then((list: SongList) => {
		songs.ingest(list.first_songs);
		songs.request(list.paths);
		return list;
	});

	return await songList;
}

// Playlist management

export async function listPlaylists(): Promise<PlaylistHeader[]> {
	return (await request("/playlists")).json();
}

export async function getPlaylist(name: string): Promise<Playlist> {
	const songs = useSongsStore();
	const response = await request("/playlist/" + encodeURIComponent(name));
	return await response.json().then((playlist: Playlist) => {
		songs.ingest(playlist.songs.first_songs);
		songs.request(playlist.songs.paths);
		return playlist;
	});
}

export async function putPlaylist(name: string, tracks: string[]): Promise<Response> {
	let playlist: SavePlaylistInput = { tracks: tracks };
	return await request("/playlist/" + encodeURIComponent(name), {
		method: "PUT",
		body: JSON.stringify(playlist),
		headers: { "Content-Type": "application/json" },
	});
}

export async function deletePlaylist(name: string): Promise<void> {
	await request("/playlist/" + encodeURIComponent(name), { method: "DELETE" });
}
// Media 

export async function get_songs(paths: string[]): Promise<{ songs: Song[], not_found: string[] }> {
	const response = await request("/songs", {
		method: "POST",
		body: JSON.stringify({ paths: [...new Set(paths).values()] }),
		headers: { "Content-Type": "application/json" },
	});
	return await response.json();
}

export async function get_peaks(path: string): Promise<Peaks> {
	const response = await request(`/peaks/${encodeURIComponent(path)}`, { method: "GET" });
	return await response.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

export function makeAudioURL(path: string) {
	return "api/audio/" + encodeURIComponent(path) + "?auth_token=" + getAuthToken();
}

export function makeThumbnailURL(path: string, size: "tiny" | "small" | "large" | "native") {
	size = size || "small";
	return `api/thumbnail/${encodeURIComponent(path)}?size=${size}&pad=false&auth_token=${getAuthToken()}`;
}
