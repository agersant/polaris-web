<template>
	<div>
		<ul class="main-nav">
			<li v-for="button in buttons" v-bind:key="button.target" v-on:click="onClickButton(button)" v-bind:class="{ noselect: 1, selected: button.pattern.test(currentURL) }">
				<i class="noselect material-icons md-18">{{ button.icon }}</i>
			</li>
		</ul>
		<ul>
			<li v-on:click="onClickLogout" v-bind:class="{ noselect: 1 }" data-cy="logout">
				<i class="noselect material-icons md-18">exit_to_app</i>
			</li>
		</ul>
	</div>
</template>

<script>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
export default {
	setup() {
		const buttons = [
			{
				icon: "library_music",
				target: "/browse",
				pattern: new RegExp("(browse|^/$)"),
			},
			{ icon: "shuffle", target: "/random", pattern: new RegExp("random") },
			{
				icon: "new_releases",
				target: "/recent",
				pattern: new RegExp("recent"),
			},
			{
				icon: "playlist_play",
				target: "/playlists",
				pattern: new RegExp("playlist"),
			},
			{ icon: "search", target: "/search", pattern: new RegExp("search") },
			{
				icon: "settings",
				target: "/settings/preferences",
				pattern: new RegExp("settings"),
			},
		];

		const route = useRoute();
		const currentURL = ref("");
		watch(
			() => route.path,
			(path) => {
				currentURL.value = path || buttons[0].target;
			},
			{immediate: true}
		);
		return {buttons, currentURL};
	},

	methods: {
		onClickButton: function (button) {
			this.$router.push(button.target).catch(err => {});
		},

		onClickLogout: function () {
			this.$store.dispatch("user/logout").then(() => this.$router.push("/").catch(err => {}));
		},
	},
};
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