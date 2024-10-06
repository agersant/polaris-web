import { Ref, ref } from 'vue';
import { useMouse } from '@vueuse/core'

import { Album, AlbumHeader, AlbumKey, BrowserEntry, Song } from "./api/dto";
import { flatten, getAlbum, getGenreSongs, getPlaylist } from "./api/endpoints";
import { formatTitle, getPathTail, pluralize } from "./format";

export type DnDPayload = DndPayloadAlbum | DndPayloadAlbumHeader | DndPayloadFiles | DndPayloadGenre | DndPayloadPaths | DndPayloadSongs;

const { x: mouseX, y: mouseY } = useMouse();

function yeet(element: HTMLElement) {
    element.style.position = "absolute";
    element.style.left = "0px";
    element.style.top = "-1000px";
}

document.querySelectorAll("#dnd-blank, #dnd-drag").forEach(e => e.remove());

export const blankElement = document.createElement("img");
blankElement.id = "dnd-blank";
blankElement.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
document.body.appendChild(blankElement);
yeet(blankElement);

const dragElement = document.createElement("div");
dragElement.id = "dnd-drag";
dragElement.className = "w-fit bg-ls-0 dark:bg-ds-950 px-2 py-1 rounded-md text-sm border-2 border-accent-200 dark:border-accent-800 text-accent-700 ring-2 ring-ls-0 dark:ring-ds-950";
dragElement.style.pointerEvents = "none";
document.body.appendChild(dragElement);
yeet(dragElement);

let storage: Ref<DnDPayload | undefined> = ref(undefined);

export function useDragAndDrop() {
    return {
        startDrag,
        updateDrag,
        endDrag,
        dragPreview: "#dnd-drag",
        activeDnD: storage,
    };
}

function startDrag(event: DragEvent, payload: DnDPayload) {
    if (!event.dataTransfer) {
        return;
    }
    event.dataTransfer.setDragImage(blankElement, 0, 0);
    dragElement.style.position = "fixed";
    dragElement.style.left = `${mouseX.value}px`;
    dragElement.style.top = `${mouseY.value}px`;
    dragElement.style.zIndex = "1000";
    storage.value = payload;
}

function updateDrag(event: DragEvent) {
    dragElement.style.left = `${mouseX.value}px`;
    dragElement.style.top = `${mouseY.value}px`;
}

function endDrag(event: DragEvent) {
    yeet(dragElement);
    storage.value = undefined;
}

export class DndPayloadFiles {
    files: BrowserEntry[];
    tracks: Promise<string[]>;

    constructor(files: BrowserEntry[]) {
        this.files = files;
        this.tracks = (
            Promise.all(this.files.map((f) => {
                if (f.is_directory) {
                    return flatten(f.path).then(s => s.paths);
                } else {
                    return Promise.resolve([f.path]);
                }
            }))
        ).then(a => a.flat());
    }

    getTracks(): Promise<string[]> {
        return this.tracks;
    }

    getIcon(): "folder" | "audio_file" | "library_music" {
        if (this.files.every(f => f.is_directory)) {
            return "folder";
        } else if (this.files.every(f => !f.is_directory)) {
            return "audio_file";
        } else {
            return "library_music";
        }
    }

    getDescription(): string {
        if (this.files.length == 1) {
            return getPathTail(this.files[0].path);
        } else if (this.files.every(f => f.is_directory)) {
            return `${this.files.length} Directories`;
        } else if (this.files.every(f => !f.is_directory)) {
            return `${this.files.length} Songs`;
        } else {
            return `${this.files.length} Files & Directories`;
        }
    }
};

export class DndPayloadAlbumHeader {
    album: AlbumHeader;
    tracks: Promise<string[]>;

    constructor(album: AlbumHeader) {
        this.album = album;
        const key: AlbumKey = {
            name: album.name,
            artists: album.main_artists,
        };
        this.tracks = getAlbum(key).then(album => album.songs.map(s => s.path));
    }

    getTracks(): Promise<string[]> {
        return this.tracks;
    }
};

export class DndPayloadAlbum {
    album: Album;
    tracks: Promise<string[]>;

    constructor(album: Album) {
        this.album = album;
        this.tracks = Promise.resolve(album.songs?.map(s => s.path) || []);
    }

    getTracks(): Promise<string[]> {
        return this.tracks;
    }
};

export class DndPayloadPaths {
    paths: string[];

    constructor(paths: string[]) {
        this.paths = paths;
    }

    getTracks(): Promise<string[]> {
        return Promise.resolve(this.paths);
    }

    getDescription(): string {
        return `${this.paths.length} ${pluralize('Song', this.paths.length)}`;
    }
};

export class DndPayloadGenre {
    genre: string;
    tracks: Promise<string[]>;

    constructor(genre: string) {
        this.genre = genre;
        this.tracks = getGenreSongs(genre).then(songList => songList.paths);
    }

    getTracks(): Promise<string[]> {
        return this.tracks;
    }
};

export class DndPayloadSongs {
    songs: Song[];
    tracks: Promise<string[]>;

    constructor(songs: Song[]) {
        this.songs = songs;
        this.tracks = Promise.resolve(songs?.map(s => s.path) || []);
    }

    getTracks(): Promise<string[]> {
        return this.tracks;
    }

    getDescription(): string {
        if (this.songs.length == 1) {
            return formatTitle(this.songs[0]);
        } else {
            return `${this.songs.length} Songs`;
        }
    }
};

