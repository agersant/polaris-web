<template>

	<div data-cy="browser" header="Files" class="flex flex-col">
		<div data-cy="browser-header" class="mt-[60px] mb-8 text-4xl font-light text-muted-color mb-8">Files</div>
		<IconField>
			<InputIcon>
				<template #default>
					<span class="material-icons-round -mt-[4px]">search</span>
				</template>
			</InputIcon>
			<InputText fluid placeholder="Search" />
		</IconField>
		<VirtualTree :value="treeModel" @node-expand="openDirectory" @node-collapse="closeDirectory" class="mt-4" />
	</div>
</template>

<script setup lang="ts">
import { produce } from 'immer';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
import { useAsyncState } from '@vueuse/core';

import VirtualTree from "@/components/basic/VirtualTree.vue";
import { Node } from "@/components/basic/VirtualTree.vue";
import { BrowserEntry } from "@/api/dto";
import { browse } from "@/api/endpoints";
import { usePlaylistStore } from "@/stores/playlist";
import { getPathTail } from '@/format';

const playlist = usePlaylistStore();

const { state: treeModel } = useAsyncState(browse("").then(f => makeTreeNodes(f, undefined)), []);
const selection = ref(null);

async function openDirectory(node: Node) {
	const parentIndex = treeModel.value.findIndex(n => n.key == node.key);
	const nextNode = treeModel.value[parentIndex + 1];
	if (nextNode && nextNode.depth > nextNode.depth) {
		return;
	}

	treeModel.value = produce(treeModel.value, (tree) => {
		const parentIndex = tree.findIndex(n => n.key == node.key);
		tree[parentIndex].loading = true;
	});

	const children = await browse(node.key || "").then(f => makeTreeNodes(f, node));

	treeModel.value = produce(treeModel.value, (tree) => {
		const parentIndex = tree.findIndex(n => n.key == node.key);
		tree.splice(parentIndex + 1, 0, ...children);
		tree[parentIndex].loading = false;
	});
}

function closeDirectory(node: Node) {
	treeModel.value = produce(treeModel.value, (tree) => {
		const parentIndex = tree.findIndex(n => n.key == node.key);
		const keepIndex = tree.slice(parentIndex + 1).findIndex(n => n.depth <= node.depth);
		const numDeletions = keepIndex >= 0 ? keepIndex : tree.length - (parentIndex + 1);
		tree.splice(parentIndex + 1, numDeletions);
	});
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

function onItemClicked(item: BrowserEntry) {
	if (item.is_directory) {
	} else {
		// TODO fix me!!
		// playlist.queueTracks([{ ...item }]);
	}
}

function onItemsDragStart(event: DragEvent, items: BrowserEntry[]) {
	if (!event || !event.dataTransfer) {
		return;
	}
	event.dataTransfer.setData("text/json", JSON.stringify(items));
}

function onQueueAll() {
	// playlist.queueDirectory(props.path);
}
</script>
