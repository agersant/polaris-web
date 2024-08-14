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
		<ScrollPanel class="mt-4 min-h-0">
			<Tree v-model:selectionKeys="selection" :value="treeModel" loadingMode="icon" @node-expand="openDirectory"
				selectionMode="multiple" metaKeySelection>
				<template #nodeicon="{ node }">
					<span class="p-tree-node-icon material-icons-round">{{ node.icon }}</span>
				</template>
			</Tree>
		</ScrollPanel>
	</div>
</template>

<script setup lang="ts">
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import ScrollPanel from 'primevue/scrollpanel';
import Tree from 'primevue/tree';
import { TreeNode } from 'primevue/treenode';

import { BrowserEntry } from "@/api/dto";
import { browse } from "@/api/endpoints";
import { usePlaylistStore } from "@/stores/playlist";
import { useAsyncState } from '@vueuse/core';
import { getPathTail } from '@/format';
import { nextTick, ref } from 'vue';
import { produce } from 'immer';

const playlist = usePlaylistStore();

const { state: treeModel } = useAsyncState(browse("").then(f => makeTreeNodes(f, [])), []);
const selection = ref(null);

async function openDirectory(node: TreeNode) {
	if ((node.children || []).length > 0) {
		return;
	}

	const findNode = (tree: TreeNode[]) => {
		var nodeToUpdate: TreeNode = { key: "", children: tree };
		for (const i of node.index_chain) {
			if (nodeToUpdate.children) {
				nodeToUpdate = nodeToUpdate.children[i];
			}
		}
		return nodeToUpdate;
	};

	treeModel.value = produce(treeModel.value, (tree) => {
		findNode(tree).loading = true;
	});

	const children = await browse(node.key || "").then(f => makeTreeNodes(f, node.index_chain));

	// TODO This is a band-aid for poor performance of Tree component https://github.com/primefaces/primevue/issues/6196
	const maxChildren = 500;
	treeModel.value = produce(treeModel.value, (tree) => {
		const nodeToUpdate = findNode(tree);
		if (!nodeToUpdate.children) {
			nodeToUpdate.children = [];
		}
		nodeToUpdate.children.push(...children.slice(0, maxChildren));
		if (children.length > maxChildren) {
			nodeToUpdate.children.push({
				key: nodeToUpdate.key + "!overflow",
				label: `[${children.length - maxChildren} more]`,
				icon: "",
				selectable: false,
				leaf: true,
			});
		}
		nodeToUpdate.loading = false;
	});

}

function makeTreeNodes(entries: BrowserEntry[], parent_indices: number[]): TreeNode[] {
	return entries.map((e, index) => {
		return {
			key: e.path,
			label: getPathTail(e.path),
			icon: e.is_directory ? "folder" : "audio_file",
			leaf: !e.is_directory,
			index_chain: [...parent_indices, index],
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
