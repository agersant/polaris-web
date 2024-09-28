<template>
    <div class="flex flex-col whitespace-nowrap">
        <PageTitle label="Genres" />

        <div v-show="treeModel.length" class="grow min-h-0 flex flex-col">
            <VirtualTree ref="tree" v-model="treeModel" class="grow" @node-expand="expandNode" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { Ref, shallowRef, watch } from 'vue';
import { useAsyncState } from '@vueuse/core';

import { AlbumHeader, ArtistHeader, GenreHeader, Song } from '@/api/dto';
import { getAlbum, getArtist, getGenre, getGenres } from '@/api/endpoints';
import PageTitle from '@/components/basic/PageTitle.vue';
import VirtualTree from '@/components/basic/VirtualTree.vue';
import { Node } from "@/components/basic/VirtualTree.vue";

defineProps<{
    genre?: string,
}>();

// TODO Play all / queue all (entire collection, sorted by genre?)
// TODO context menus
// TODO loading state
// TODO error state
// TODO empty state
// TODO drag and drop to playlist
// TODO Enter to play selection 
// TODO Filter albums and songs to only those that match parent genre
// TODO auto-scroll and expand when following link?
// TODO genre color dots / draw as badges?
// TODO tiny album icons?
// TODO dark mode
// TODO persistence

type GenreTreeNode = GenreNode | ArtistNode | AlbumNode | SongNode;

interface GenreNode extends Node {
    kind: "genre",
    header: GenreHeader,
}

interface ArtistNode extends Node {
    kind: "artist",
    header: ArtistHeader,
}

interface AlbumNode extends Node {
    kind: "album",
    header: AlbumHeader,
}

interface SongNode extends Node {
    kind: "song",
    song: Song,
}

const { state: genres, isLoading, error } = useAsyncState(
    () => getGenres().then(genres => genres.map(makeGenreNode)),
    undefined,
);

const treeModel: Ref<GenreTreeNode[]> = shallowRef([]);

watch(genres, (v) => {
    if (v && !treeModel.value.length) {
        treeModel.value = v;
    }
});

function makeGenreNode(genre: GenreHeader): GenreNode {
    return {
        kind: "genre",
        header: genre,
        depth: 0,
        key: genre.name,
        label: genre.name,
        icon: "label",
        leaf: false,
    };
}

function makeArtistNode(artist: ArtistHeader, parent: GenreNode): ArtistNode {
    return {
        kind: "artist",
        header: artist,
        depth: 1,
        key: parent.key + artist.name,
        label: artist.name,
        icon: "person",
        leaf: false,
    };
}

function makeAlbumNode(album: AlbumHeader, parent: ArtistNode): AlbumNode {
    return {
        kind: "album",
        header: album,
        depth: 2,
        key: parent.key + album.name,
        label: `${album.year || '????'} - ${album.name}`,
        icon: "album",
        leaf: false,
    };
}

function makeSongNode(song: Song, parent: AlbumNode): SongNode {
    return {
        kind: "song",
        song: song,
        depth: 3,
        key: parent.key + song.path,
        label: `${song.track_number || '??'}. ${song.title}`,
        icon: "audiotrack",
        leaf: true,
    };
}

async function expandNode(node: GenreTreeNode) {
    {
        let parentIndex = treeModel.value.findIndex(n => n.key == node.key);
        const nextNode = treeModel.value[parentIndex + 1];
        if (nextNode && nextNode.depth > node.depth) {
            return;
        }
        treeModel.value[parentIndex].loading = true;
    }

    let children;
    try {
        if (node.kind == "genre") {
            children = (await getGenre(node.header.name)).artists.map(a => makeArtistNode(a, node));
        } else if (node.kind == "artist") {
            children = (await getArtist(node.header.name)).albums.map(a => makeAlbumNode(a, node));
        } else if (node.kind == "album") {
            const key = {
                artists: node.header.main_artists,
                name: node.header.name,
            };
            children = (await getAlbum(key)).songs.map(s => makeSongNode(s, node));
        }
    } catch (e) { }

    {
        let parentIndex = treeModel.value.findIndex(n => n.key == node.key);
        let newModel = [...treeModel.value];
        if (children) {
            newModel.splice(parentIndex + 1, 0, ...children);
        }
        newModel[parentIndex] = { ...newModel[parentIndex], loading: false };
        treeModel.value = newModel;
    }
}

</script>
