<template>
	<div class="flex flex-col">
		<PageTitle label="Files" />

		<InputText class="mb-8" v-model="filterQuery" id="filter" placeholder="Filter" icon="filter_alt" autofocus
			clearable />

		<div v-show="treeModel.length" class="grow min-h-0 flex flex-col">
			<VirtualTree id="all-files" v-show="!showFiltered" ref="tree" v-model="treeModel"
				@node-expand="openDirectory" @node-double-click="playSong" @keydown="onKeyDown"
				@nodes-drag-start="onDragStart" @nodes-drag="updateDrag" @nodes-drag-end="endDrag"
				@nodes-restored="onNodesRestored" class="grow" />
			<div v-if="showFiltered" class="grow min-h-0 flex flex-col">
				<Error v-if="filterError">
					Something went wrong while filtering files.
				</Error>
				<VirtualTree id="filtered-files" ref="filteredTree" v-else-if="filterTreeModel.length"
					v-model="filterTreeModel" @node-double-click="playSong" @keydown="onKeyDown"
					@nodes-drag-start="onDragStartFiltered" @nodes-drag="updateDrag" @nodes-drag-end="endDrag" />
				<div v-else-if="filtering" class="grow flex mt-24 items-start justify-center">
					<Spinner />
				</div>
				<div v-else class="grow flex items-start mt-40 justify-center text-center">
					<BlankStateFiller icon="filter_alt_off">
						No files match this filter.
					</BlankStateFiller>
				</div>
			</div>
		</div>

		<Error v-if="!treeModel.length && error">
			Something went wrong while listing files.
		</Error>

		<div v-else-if="!treeModel.length && isReady" class="grow flex items-start mt-40 justify-center text-center">
			<BlankStateFiller icon="folder_off" suggestion="collectionSettings">
				No files found.
			</BlankStateFiller>
		</div>

		<div v-else-if="!treeModel.length && isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner />
		</div>

		<Teleport :to="dragPreview" v-if="draggedFiles === activeDnD">
			<div class="flex items-center gap-2">
				<span v-text="draggedFiles?.getIcon()" class="material-icons-round" />
				<span v-text="draggedFiles?.getDescription()" />
			</div>
		</Teleport>

	</div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useAsyncState } from "@vueuse/core";

import { BrowserEntry } from "@/api/dto";
import { browse, flatten, search } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import VirtualTree from "@/components/basic/VirtualTree.vue";
import { Node } from "@/components/basic/VirtualTree.vue";
import { DndPayloadFiles, useDragAndDrop } from '@/dnd';
import { getPathTail } from '@/format';
import { useHistory } from "@/history";
import { usePlaybackStore } from "@/stores/playback";
import { useSongsStore } from "@/stores/songs";

const playback = usePlaybackStore();
const songs = useSongsStore();
const { activeDnD, startDrag, updateDrag, endDrag, dragPreview } = useDragAndDrop();

const treeModel: Ref<Node[]> = shallowRef([]);
const filterTreeModel: Ref<Node[]> = shallowRef([]);

const { state: topLevel, isLoading, isReady, error } = useAsyncState(browse("").then(f => makeTreeNodes(f, undefined)), []);
watch(topLevel, (v) => {
	if (!treeModel.value.length) {
		treeModel.value = v;
	}
});

const filterQuery = ref("");
const showFiltered = computed(() => filterQuery.value.length);

const { state: filterResults, isLoading: filtering, error: filterError, execute: fetchFiltered } = useAsyncState(
	async () => {
		if (filterQuery.value.length < 2) {
			return Promise.resolve(undefined);
		}
		let paths = (await search(`path % "${filterQuery.value}"`)).paths;
		paths.sort();
		return paths;
	},
	undefined, { immediate: false, resetOnExecute: false }
);

watch(filterQuery, (to, from) => {
	if (!filterResults.value || !to.startsWith(from)) {
		filterTreeModel.value = [];
	}
	if (filterQuery.value.length > 2) {
		fetchFiltered();
	}
});

watch(filterResults, () => {
	let nodes = [];
	let folders = new Set<string>();
	const separator = /[\/\\]/g;

	for (let path of (filterResults.value || [])) {
		let depth = 0;
		let match;
		let skippedRoot = false;
		while ((match = separator.exec(path)) !== null) {
			const directory = path.substring(0, match.index);
			if (!skippedRoot && treeModel.value[0].key != directory) {
				skippedRoot = true;
				continue;
			}
			if (directory != path && !folders.has(directory)) {
				folders.add(directory);
				nodes.push({ depth, key: directory, label: getPathTail(directory), icon: "folder", leaf: false });
			}
			depth += 1;
		}
		nodes.push({ depth, key: path, label: getPathTail(path), icon: "audio_file", leaf: true });
	}

	filterTreeModel.value = nodes;
});

const tree = useTemplateRef("tree");
const filteredTree = useTemplateRef("filteredTree");
const draggedFiles: Ref<DndPayloadFiles | null> = ref(null);

async function openDirectory(node: Node) {
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
		children = await browse(node.key || "").then(f => makeTreeNodes(f, node));
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

function makeTreeNodes(entries: BrowserEntry[], parent?: Node): Node[] {
	return entries.map((e, index) => {
		return {
			depth: parent ? parent.depth + 1 : 0,
			key: e.path,
			label: getPathTail(e.path),
			icon: e.is_directory ? "folder" : "audio_file",
			leaf: !e.is_directory,
		};
	});
}

async function onKeyDown(event: KeyboardEvent) {
	if (event.code == "Enter") {
		const selection = showFiltered.value ? getSelectionFiltered() : await getSelectionUnfiltered();
		queue(selection, !event.shiftKey);
	}
}

async function getSelectionUnfiltered(): Promise<string[]> {
	if (!tree.value) {
		return [];
	}
	return (
		await Promise.all(tree.value.selection.map((e) => {
			if (e.leaf) {
				return Promise.resolve(e.key);
			} else {
				return flatten(e.key).then(s => s.paths);
			}
		}))
	).flat();
}

function getSelectionFiltered(): string[] {
	if (!filteredTree.value) {
		return [];
	}

	let tracks: string[] = [];
	const model = filterTreeModel.value;
	for (const node of filteredTree.value.selection) {
		if (node.leaf) {
			tracks.push(node.key);
		} else {
			const startIndex = model.findIndex(n => n.key == node.key);
			for (let i = startIndex + 1; i > 0 && i < model.length; i++) {
				if (model[i].depth <= model[startIndex].depth) {
					break;
				}
				if (!model[i].leaf) {
					continue;
				}
				tracks.push(model[i].key);
			}
		}
	};
	return tracks;
}

function playSong(node: Node) {
	if (node.leaf) {
		playback.clear();
		playback.stop();
		playback.queueTracks([node.key]);
	}
}

function onDragStart(event: DragEvent, nodes: Node[]) {
	draggedFiles.value = new DndPayloadFiles(nodes.map(n => {
		return { path: n.key, is_directory: !n.leaf };
	}));
	startDrag(event, draggedFiles.value);
}

function onDragStartFiltered(event: DragEvent, nodes: Node[]) {
	const selection = getSelectionFiltered();
	draggedFiles.value = new DndPayloadFiles(selection.map(path => {
		return { path, is_directory: false };
	}));
	startDrag(event, draggedFiles.value);
}

async function queue(paths: string[], replace: boolean) {
	if (!paths.length) {
		return;
	}
	if (replace) {
		playback.clear();
		playback.stop();
	}
	playback.queueTracks(paths);
}

function onNodesRestored() {
	songs.request(treeModel.value.filter(n => n.leaf).map(n => n.key))
}

useHistory("files", [filterQuery]);
</script>
