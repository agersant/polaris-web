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
	ddns_update_url: string;
};

export type NewSettings = {
	album_art_pattern?: string;
	ddns_update_url?: string;
};

export type IndexStatus = {
	state: "OutOfDate" | "InProgress" | "UpToDate";
	last_start_time?: number,
	last_end_time?: number,
	num_songs_indexed: number,
};

export type BrowserEntry = {
	is_directory: boolean;
	path: string;
};

export interface GenreHeader {
	name: string;
}

export interface Genre extends GenreHeader {
	related_genres: { [key: string]: number };
	main_artists: ArtistHeader[],
	recently_added: AlbumHeader[],
}

export interface ArtistHeader {
	name: string;
	num_albums_as_performer: number;
	num_albums_as_additional_performer: number;
	num_albums_as_composer: number;
	num_albums_as_lyricist: number;
	num_songs_by_genre: { [key: string]: number };
	num_songs: number;
}

export interface Contribution {
	performer: boolean,
	composer: boolean,
	lyricist: boolean,
}

export interface ArtistAlbum extends AlbumHeader {
	contributions: Contribution[],
}

export interface Artist extends ArtistHeader {
	albums: ArtistAlbum[]
}

export interface AlbumKey {
	artists: string[],
	name: string,
}

export interface AlbumHeader {
	name: string,
	main_artists: string[],
	artwork?: string,
	year?: number,
}

export interface Album extends AlbumHeader {
	songs: Song[],
}

export interface SongList {
	paths: string[];
	first_songs: Song[];
}

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

export type SavePlaylistInput = {
	tracks: string[];
};

export interface PlaylistHeader {
	name: string;
	num_songs_by_genre: { [key: string]: number };
	duration: number;
};

export interface Playlist extends PlaylistHeader {
	songs: SongList,
};
