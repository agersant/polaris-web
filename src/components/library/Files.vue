<template>
	<div data-cy="browser" class="flex flex-col">
		<div data-cy="browser-header"
			class="my-10 py-[0.5px] text-5xl font-light text-ls-500 tracking-widest dark:text-ds-300">
			Files
		</div>
		<InputText v-model="searchQuery" id="search" name="search" placeholder="Search" icon="search" />
		<VirtualTree ref="tree" :value="treeModel" @node-expand="openDirectory" @keydown="onKeyDown"
			class="mt-4 grow" />
	</div>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';

import InputText from "@/components/basic/InputText.vue";
import VirtualTree from "@/components/basic/VirtualTree.vue";
import { Node } from "@/components/basic/VirtualTree.vue";
import { BrowserEntry } from "@/api/dto";
import { browse, flatten } from "@/api/endpoints";
import { usePlaylistStore } from "@/stores/playlist";
import { getPathTail } from '@/format';
import { Ref, ref } from 'vue';

const playlist = usePlaylistStore();

const { state: treeModel } = useAsyncState(browse("").then(f => makeTreeNodes(f, undefined)), []);

const tree: Ref<InstanceType<typeof VirtualTree> | null> = ref(null);
const searchQuery = ref("");

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
	} catch (e) {
		// TODO fixme
		// toast.add({ severity: 'error', summary: "API Error", detail: `Failed to download directory content for '${node.label}'`, life: 3000 });
	}

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
		queueSelection();
	}
}

async function queueSelection() {
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

	playlist.clear();
	playlist.queueTracks(tracks);
}
</script>
