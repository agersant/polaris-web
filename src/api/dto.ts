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

export type CollectionItem = Directory | Song;

export type CollectionItemRaw = {
	variant?: string;
	Directory?: Directory;
	Song?: Song;
};

export interface Directory {
	variant: "Directory";
	path: string;
	artist?: string;
	year?: number;
	album?: string;
	artwork?: string;
	date_added?: number;
}

export interface Song {
	variant: "Song";
	path: string;
	track_number: number | null;
	disc_number: number | null;
	title: string | null;
	artist: string | null;
	album_artist: string | null;
	year: number | null;
	album: string | null;
	artwork: string | null;
	duration: number | null;
	lyricist: string | null;
	composer: string | null;
	genre: string | null;
	label: string | null;
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
