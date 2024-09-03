<template>
	<div
		class="w-80 rounded-lg flex flex-col overflow-hidden border select-none bg-ls-0 dark:bg-ds-900 border-ls-200 dark:border-ds-700 p-6 pb-0">
		<img src="/assets/logo.svg" class="mt-4 mb-10 mx-4" />
		<nav class="grow flex flex-col gap-y-7">

			<ul class="-mx-2 space-y-1">
				<li v-for="item in navigation" :key="item.label">
					<SidebarItem :data-cy="item['data-cy']" :action="item.action" :label="item.label" :icon="item.icon"
						:current="isCurrent(item)" />
				</li>
			</ul>

			<div>
				<div class="text-xs text-ls-400 dark:text-ds-400 uppercase">Playlists</div>
				<ul class="-mx-2 mt-2 space-y-1">
					<li v-for="playlist in playlists">
						<SidebarItem :action="() => { }" :label="playlist.name" icon="queue_music"
							class="italic !font-normal text-sm text-ls-500 dark:text-ds-500" />
					</li>
				</ul>
			</div>

			<div class="-mx-6 mt-auto">
				<a @click="user.logout" class="cursor-pointer flex items-center gap-x-4 px-6 py-3 text-sm font-semibold
						text-ls-700 dark:text-ds-400
						hover:bg-ls-50 dark:hover:bg-ds-900">
					<span class="material-icons-round text-ls-400">logout</span>
					<span>Sign Out</span>
				</a>
			</div>

		</nav>
	</div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import SidebarItem from "@/components/SidebarItem.vue";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const currentURL = computed(() => route.path);

const navigateTo = (url: string) => { return () => router.push(url).catch(err => { }); };

interface Item {
	label: string,
	icon: string,
	'data-cy': string,
	pattern?: RegExp,
	action: () => void,
}

function isCurrent(item: Item) {
	return !!item.pattern?.test(currentURL.value);
}

const navigation: Ref<Item[]> = ref([
	{ label: "Files", icon: "folder", "data-cy": "files", pattern: new RegExp("^/files"), action: navigateTo("/files") },
	{ label: "Artists", icon: "person", "data-cy": "artists", pattern: new RegExp("^/artists"), action: navigateTo("/artists") },
	{ label: "Albums", icon: "library_music", "data-cy": "albums", pattern: new RegExp("^/albums"), action: navigateTo("/albums") },
	{ label: "Songs", icon: "music_note", "data-cy": "songs", pattern: new RegExp("^/songs"), action: navigateTo("/songs") },
	{ label: "Playlists", icon: "playlist_play", "data-cy": "playlists", pattern: new RegExp("^/playlist"), action: navigateTo("/playlists") },
	{ label: "Search", icon: "search", "data-cy": "search", pattern: new RegExp("^/search"), action: navigateTo("/search") },
	{ label: "Settings", icon: "settings", "data-cy": "settings", pattern: new RegExp("^/settings"), action: navigateTo("/settings/preferences") },
]);

const playlists = [
	{ name: "Summer 2024" },
	{ name: "Winter 2023" },
	{ name: "Fall 2023" },
];
</script>
