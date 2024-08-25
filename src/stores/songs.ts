import { ShallowRef, shallowRef } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { Song } from "@/api/dto";

export const useSongsStore = defineStore("songs", () => {

    const cache: ShallowRef<Map<string, Song>> = shallowRef(new Map());

    function ingest(songs: Song[]) {
        for (let song of songs) {
            cache.value.set(song.path, song);
        }
    }

    return {
        cache,
        ingest,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSongsStore, import.meta.hot));
}
