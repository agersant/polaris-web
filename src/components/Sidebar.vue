<template>
	<div data-cy="sidebar">
		<ul class="main-nav">
			<li v-for="button in buttons" v-bind:key="button.url" v-on:click="onClickButton(button)"
				v-bind:data-cy="button.cy" v-bind:class="{ noselect: 1, selected: button.pattern.test(currentURL) }">
				<i class="noselect material-icons md-18">{{ button.icon }}</i>
			</li>
		</ul>
		<ul>
			<li v-on:click="user.logout" v-bind:class="{ noselect: 1 }" data-cy="logout">
				<i class="noselect material-icons md-18">exit_to_app</i>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const user = useUserStore();

type SidebarButton = {
	cy: string,
	icon: string,
	url: string,
	pattern: RegExp,
}

const currentURL = ref("");
const buttons: SidebarButton[] = [
	{
		cy: "browse",
		icon: "library_music",
		url: "/browse",
		pattern: new RegExp("(browse|^/$)"),
	},
	{
		cy: "random",
		icon: "shuffle",
		url: "/random",
		pattern: new RegExp("random"),
	},
	{
		cy: "recent",
		icon: "new_releases",
		url: "/recent",
		pattern: new RegExp("recent"),
	},
	{
		cy: "playlists",
		icon: "playlist_play",
		url: "/playlists",
		pattern: new RegExp("playlist"),
	},
	{
		cy: "search",
		icon: "search",
		url: "/search",
		pattern: new RegExp("search"),
	},
	{
		cy: "settings",
		icon: "settings",
		url: "/settings/preferences",
		pattern: new RegExp("settings"),
	},
];

watch(() => route.path,
	(path) => {
		currentURL.value = path || buttons[0].url;
	},
	{ immediate: true }
);

function onClickButton(button: SidebarButton) {
	router.push(button.url).catch(err => {});
}
</script>

<style scoped>
div {
	height: 100%;
	display: flex;
	flex-direction: column;
}

ul {
	text-align: center;
	background-color: var(--theme-menu-background);
}

ul.main-nav {
	flex-grow: 1;
}

li {
	height: 50px;
	box-sizing: border-box;
}

li i.material-icons {
	color: var(--theme-foreground-against-accent);
	line-height: 50px;
}

.selected {
	background-color: var(--theme-accent);
}
</style>