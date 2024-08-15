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
		<VirtualTree :value="treeModel" @node-expand="openDirectory" @node-collapse="closeDirectory" class="mt-4">
			<template #icon="{ node }">
				<span class="material-icons-round mr-1">{{ node.icon }}</span>
			</template>
		</VirtualTree>
	</div>
</template>

<script setup lang="ts">
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
	{
		let parentIndex = treeModel.value.findIndex(n => n.key == node.key);
		const nextNode = treeModel.value[parentIndex + 1];
		if (nextNode && nextNode.depth > nextNode.depth) {
			return;
		}
		treeModel.value[parentIndex].loading = true;
	}

	const children = await browse(node.key || "").then(f => makeTreeNodes(f, node));

	{
		let parentIndex = treeModel.value.findIndex(n => n.key == node.key);
		let newModel = [...treeModel.value];
		newModel.splice(parentIndex + 1, 0, ...children);
		newModel[parentIndex] = { ...newModel[parentIndex], loading: false };
		treeModel.value = newModel;
	}
}

function closeDirectory(node: Node) {
	const parentIndex = treeModel.value.findIndex(n => n.key == node.key);
	const keepIndex = treeModel.value.slice(parentIndex + 1).findIndex(n => n.depth <= node.depth);
	const numDeletions = keepIndex >= 0 ? keepIndex : treeModel.value.length - (parentIndex + 1);

	let newModel = [...treeModel.value];
	newModel.splice(parentIndex + 1, numDeletions);
	treeModel.value = newModel;
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
