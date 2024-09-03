<template>
	<div data-cy="browser" class="flex flex-col">
		<SectionTitle label="Files" data-cy="browser-header" />

		<div v-if="error" class="grow flex items-start justify-center">
			<div class="rounded-md w-full bg-red-50 dark:bg-red-900 p-4">
				<div class="flex items-center">
					<span class="material-icons-round text-red-400 dark:text-red-400 mt-0.5">
						error_outline
					</span>
					<div class="ml-3">
						<p class="text-sm font-medium text-red-800 dark:text-red-200">
							Something went wrong while listing files.
						</p>
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="isReady && !treeModel.length" class="grow flex items-start mt-40 justify-center text-center">
			<BlankStateFiller icon="folder_off">
				No files found.
				<span v-if="user.isAdmin">Please verify<br />your
					<a @click="router.push('/settings/collection')" class="cursor-pointer text-accent-600 underline">
						Collection settings
					</a>.
				</span>
			</BlankStateFiller>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner class="text-ls-700 dark:text-ds-400" />
		</div>

		<div v-else class="grow min-h-0 flex flex-col">
			<InputText class="mb-8" v-model="searchQuery" id="search" name="search" placeholder="Search"
				icon="search" />
			<VirtualTree ref="tree" :value="treeModel" @node-expand="openDirectory" @keydown="onKeyDown"
				@nodes-drag-start="onDragStart" @nodes-drag="onDrag" @nodes-drag-end="onDragEnd" class="grow" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { useAsyncState } from "@vueuse/core";

import { BrowserEntry } from "@/api/dto";
import { browse, flatten } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import InputText from "@/components/basic/InputText.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import VirtualTree from "@/components/basic/VirtualTree.vue";
import { Node } from "@/components/basic/VirtualTree.vue";
import { DnDPayload, DndPayloadFiles, endDrag, startDrag, updateDrag } from '@/dnd';
import { getPathTail } from '@/format';
import { usePlaybackStore } from "@/stores/playback";
import { useUserStore } from '@/stores/user';

const router = useRouter();
const user = useUserStore();
const playback = usePlaybackStore();

const { state: treeModel, isReady, isLoading, error } = useAsyncState(browse("").then(f => makeTreeNodes(f, undefined)), []);

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
	const payload: DnDPayload = new DndPayloadFiles(nodes.map(n => {
		return {
			path: n.key,
			is_directory: !n.leaf,
		};
	}));
	startDrag(event, payload);
}

function onDrag(event: DragEvent) {
	updateDrag(event);
}

function onDragEnd(event: DragEvent) {
	endDrag(event);
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
