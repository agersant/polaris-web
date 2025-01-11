<template>
	<div data-pw="sidebar"
		class="w-80 rounded-lg flex flex-col overflow-hidden border bg-ls-0 dark:bg-ds-900 border-ls-200 dark:border-ds-700 p-6 pb-0">
		<img src="/assets/logo.svg" class="mt-4 mb-10 mx-4" />
		<nav class="grow flex flex-col gap-y-7">

			<ul class="-mx-2 space-y-1">
				<li v-for="item in navigation" :key="item.label">
					<SidebarItem :action="item.action" :label="item.label" :icon="item.icon" :current="isCurrent(item)"
						:data-pw="item.testID" />
				</li>
			</ul>

			<div class="-mx-6 mt-auto">
				<a @click="user.logout" data-pw="logout" class="cursor-pointer flex items-center gap-x-4 px-6 py-3 text-sm font-semibold
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
	pattern?: RegExp,
	testID?: string,
	action: () => void,
}

function isCurrent(item: Item) {
	return !!item.pattern?.test(currentURL.value);
}

const navigation: Ref<Item[]> = ref([
	{ label: "Files", icon: "folder", pattern: new RegExp("^/files"), testID: "files", action: navigateTo("/files") },
	{ label: "Genres", icon: "label", pattern: new RegExp("^/genres"), testID: "genres", action: navigateTo("/genres") },
	{ label: "Artists", icon: "person", pattern: new RegExp("^/artists"), testID: "artists", action: navigateTo("/artists") },
	{ label: "Albums", icon: "library_music", pattern: new RegExp("^/albums"), testID: "albums", action: navigateTo("/albums") },
	{ label: "Playlists", icon: "playlist_play", pattern: new RegExp("^/playlist"), testID: "playlists", action: navigateTo("/playlists") },
	{ label: "Search", icon: "search", pattern: new RegExp("^/search"), testID: "search", action: navigateTo("/search") },
	{ label: "Settings", icon: "settings", pattern: new RegExp("^/settings"), testID: "settings", action: navigateTo("/settings/preferences") },
]);
</script>
