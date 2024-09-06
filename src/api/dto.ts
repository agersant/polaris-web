export const API_ARRAY_SEPARATOR = "\u{000C}";

export type Authorization = {
	username: string;
	token: string;
	is_admin: boolean;
};

export type InitialSetup = {
	has_any_users: boolean;
};

export type MountDir = {
	source: string;
	name: string;
};

export type User = {
	name: string;
	is_admin: boolean;
};

export type NewUser = {
	name: string;
	password: string;
	admin: boolean;
};

export type UserUpdate = {
	new_password?: string;
	new_is_admin?: boolean;
};

export type Settings = {
	album_art_pattern: string;
	reindex_every_n_seconds: number;
};

export type NewSettings = {
	album_art_pattern?: string;
	reindex_every_n_seconds?: number;
};

export type DDNSConfig = {
	host: string;
	username: string;
	password: string;
};

export type Preferences = {
	lastfm_username?: string | null;
	web_theme_base?: string | null;
	web_theme_accent?: string | null;
};

export type BrowserEntry = {
	is_directory: boolean;
	path: string;
};

export interface Song {
	path: string;
	track_number?: number;
	disc_number?: number;
	title?: string;
	artists?: string[];
	album_artists?: string[];
	year?: number;
	album?: string;
	artwork?: string;
	duration?: number;
	lyricists?: string[];
	composers?: string[];
	genres?: string[];
	labels?: string[];
}

export type Peaks = Uint8Array;

export interface SongList {
	paths: string[];
	first_songs: Song[];
}

export interface ArtistHeader {
	name: string;
	num_albums_as_performer: number;
	num_albums_as_additional_performer: number;
	num_albums_as_composer: number;
	num_albums_as_lyricist: number;
	num_songs_by_genre: { [key: string]: number };
}

export interface AlbumKey {
	artists: string[],
	name?: string,
}

export interface AlbumHeader {
	name?: string,
	artwork?: string,
	artists?: string[],
	year?: number,
}

export interface Album {
	name?: string,
	artwork?: string,
	artists?: string[],
	year?: number,
	songs: Song[],
}

export type SavePlaylistInput = {
	tracks: string[];
};

export type ListPlaylistsEntry = {
	name: string;
};

export type LastFMLinkToken = {
	value: string;
};
