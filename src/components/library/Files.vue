<template>
	<div data-cy="browser" class="flex flex-col">
		<SectionTitle label="Files" data-cy="browser-header" />

		<div v-show="treeModel.length" class="grow min-h-0 flex flex-col">
			<InputText class="mb-8" v-model="searchQuery" id="search" name="search" placeholder="Search"
				icon="search" />
			<VirtualTree ref="tree" v-model="treeModel" @node-expand="openDirectory" @keydown="onKeyDown"
				@nodes-drag-start="onDragStart" @nodes-drag="updateDrag" @nodes-drag-end="endDrag" class="grow" />
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
			<Spinner class="text-ls-700 dark:text-ds-400" />
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
import { Ref, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useAsyncState } from "@vueuse/core";

import { BrowserEntry } from "@/api/dto";
import { browse, flatten } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import VirtualTree from "@/components/basic/VirtualTree.vue";
import { Node } from "@/components/basic/VirtualTree.vue";
import { DndPayloadFiles, useDragAndDrop } from '@/dnd';
import { getPathTail } from '@/format';
import { usePlaybackStore } from "@/stores/playback";

const playback = usePlaybackStore();
const { activeDnD, startDrag, updateDrag, endDrag, dragPreview } = useDragAndDrop();

const treeModel: Ref<Node[]> = shallowRef([]);

const { state: topLevel, isLoading, isReady, error } = useAsyncState(browse("").then(f => makeTreeNodes(f, undefined)), []);
watch(topLevel, (v) => {
	if (!treeModel.value.length) {
		treeModel.value = v;
	}
});

const tree = useTemplateRef("tree");
const searchQuery = ref("");
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

function onKeyDown(event: KeyboardEvent) {
	if (event.code == "Enter") {
		queueSelection(!event.shiftKey);
	}
}

function onDragStart(event: DragEvent, nodes: Node[]) {
	draggedFiles.value = new DndPayloadFiles(nodes.map(n => {
		return {
			path: n.key,
			is_directory: !n.leaf,
		};
	}));
	startDrag(event, draggedFiles.value);
}

async function queueSelection(replace: boolean) {
	if (!tree.value) {
		return;
	}

	const tracks = (
		await Promise.all(tree.value.selection.map((e) => {
			if (e.leaf) {
				return Promise.resolve(e.key);
			} else {
				return flatten(e.key).then(s => s.paths);
			}
		}))
	).flat();

	if (replace) {
		playback.clear();
	}
	playback.queueTracks(tracks);
	if (replace) {
		playback.next();
	}
}
</script>
