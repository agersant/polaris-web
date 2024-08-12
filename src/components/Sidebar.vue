<template>
	<Menu :model="menuItems" class="w-80 p-6 overflow-hidden" pt:submenuLabel:class="text-sm uppercase"
		pt:separator:class="my-2 opacity-0">
		<template #start>
			<img src="/assets/logo.svg" class="my-8 mx-4" />
		</template>
		<template #item="{ item }">
			<a :class="['p-menu-item-link', ...itemClasses(item)]" :data-cy="item['data-cy']" tabindex="-1">
				<span :class="['material-icons-round', ...iconClasses(item)]">{{ item.icon }}</span>
				<span class="p-menu-item-label">{{ item.label }}</span>
			</a>
		</template>
	</Menu>
</template>

<script setup lang="ts">
import Menu from 'primevue/menu';
import { MenuItem } from 'primevue/menuitem';
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const currentURL = computed(() => route.path);

const navigateTo = (url: string) => { return () => router.push(url).catch(err => { }); };

const itemClasses = (item: MenuItem) => {
	if (!item.pattern || !item.pattern.test(currentURL.value)) {
		return [];
	}
	return ["bg-primary", "rounded-md", "!text-primary-contrast", "font-medium"];
}

const iconClasses = (item: MenuItem) => {
	if (!item.pattern || !item.pattern.test(currentURL.value)) {
		return ["p-menu-item-icon"];
	}
	return [];
}

const menuItems = ref([
	{
		label: "Library",
		items: [
			{ label: "Files", icon: "folder", "data-cy": "files", pattern: new RegExp("files"), command: navigateTo("/files") },
			{ label: "Artists", icon: "person", "data-cy": "artists", pattern: new RegExp("artists"), command: navigateTo("/artists") },
			{ label: "Albums", icon: "library_music", "data-cy": "albums", pattern: new RegExp("albums"), command: navigateTo("/albums") },
			{ label: "Songs", icon: "music_note", "data-cy": "songs", pattern: new RegExp("songs"), command: navigateTo("/songs") },
			{ label: "Search", icon: "search", "data-cy": "search", pattern: new RegExp("search"), command: navigateTo("/search") },
		]
	},
	{ separator: true },
	{
		label: "Profile",
		items: [
			{ label: "Playlists", icon: "playlist_play", "data-cy": "playlists", pattern: new RegExp("playlist"), command: navigateTo("/playlists") },
			{ label: "Settings", icon: "settings", "data-cy": "settings", pattern: new RegExp("settings"), command: navigateTo("/settings/preferences") },
			{ label: "Sign Out", icon: "logout", "data-cy": "logout", command: () => { user.logout(); } },
		]
	},
	{ separator: true },
	{
		label: "Playlists",
		items: [
			{ label: "Summer", icon: "queue_music" },
			{ label: "Fall", icon: "queue_music" },
			{ label: "Winter", icon: "queue_music" },
		]
	},
]);
</script>
