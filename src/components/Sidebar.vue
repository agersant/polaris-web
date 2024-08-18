<template>
	<div class="w-80 rounded-lg flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 p-6 pb-0">
		<img src="/assets/logo.svg" class="mt-8 mb-14 mx-4" />
		<nav class="grow flex flex-col">
			<ul class="grow flex flex-col gap-y-7">

				<li v-for="category of navigation">
					<div class="text-xs text-gray-400 uppercase">{{ category.label }}</div>
					<ul class="-mx-2 mt-2 space-y-1">
						<li v-for="item in category.items" :key="item.label">
							<SidebarItem :data-cy="item['data-cy']" :action="item.action" :label="item.label"
								:icon="item.icon" :current="isCurrent(item)" />
						</li>
					</ul>
				</li>

				<li>
					<div class="text-xs text-gray-400 uppercase">Playlists</div>
					<ul class="-mx-2 mt-2 space-y-1">
						<li v-for="playlist in playlists">
							<SidebarItem :action="() => { }" :label="playlist.name" icon="queue_music" />
						</li>
					</ul>
				</li>

				<li class="-mx-6 mt-auto">
					<a @click="user.logout" class="cursor-pointer flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6
						text-gray-900 dark:text-white
						hover:bg-gray-50 dark:hover:bg-gray-800">
						<span
							class="material-icons-round text-gray-400 group-hover:text-accent-600 h-6 w-6 shrink-0">logout</span>
						<span>Sign Out</span>
					</a>
				</li>
			</ul>

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

interface Category {
	label: string,
	items: Item[],
}

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

const navigation: Ref<Category[]> = ref([
	{
		label: "Library",
		items: [
			{ label: "Files", icon: "folder", "data-cy": "files", pattern: new RegExp("files"), action: navigateTo("/files") },
			{ label: "Artists", icon: "person", "data-cy": "artists", pattern: new RegExp("artists"), action: navigateTo("/artists") },
			{ label: "Albums", icon: "library_music", "data-cy": "albums", pattern: new RegExp("albums"), action: navigateTo("/albums") },
			{ label: "Songs", icon: "music_note", "data-cy": "songs", pattern: new RegExp("songs"), action: navigateTo("/songs") },
			{ label: "Search", icon: "search", "data-cy": "search", pattern: new RegExp("search"), action: navigateTo("/search") },
		]
	},
	{
		label: "Profile",
		items: [
			{ label: "Playlists", icon: "playlist_play", "data-cy": "playlists", pattern: new RegExp("playlist"), action: navigateTo("/playlists") },
			{ label: "Settings", icon: "settings", "data-cy": "settings", pattern: new RegExp("settings"), action: navigateTo("/settings/preferences") },
		]
	},
]);

const playlists = [
	{ name: "Summer" },
	{ name: "Fall" },
	{ name: "Winter" },
];
</script>
