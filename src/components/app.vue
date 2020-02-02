<template>
	<div>
		<sidebar class="sidebar"></sidebar>
		<router-view></router-view>
		<playlist></playlist>
		<player></player>
	</div>
</template>

<script>
import API from "/src/api";
import * as Theming from "/src/theming/theming";
import Sidebar from "./sidebar";
import Player from "./playback/player";
import Playlist from "./playback/playlist";

export default {
	components: {
		sidebar: Sidebar,
		player: Player,
		playlist: Playlist
	},

	mounted() {
		this.applyTheme();
	},

	methods: {
		applyTheme() {
			API.getPreferences().then(data => {
				Theming.setBase(data.web_theme_base);
				Theming.setAccentColor(data.web_theme_accent);
			});
		}
	}
};
</script>

<style>
.pane,
.player {
	overflow-x: hidden;
	background-color: var(--theme-background);
}

.sidebar {
	position: absolute;
	width: 50px;
	height: 100%;
}

.pane.left {
	position: absolute;
	width: calc(40% - 50px);
	left: 50px;
	height: 100%;
}

.pane.right {
	position: absolute;
	width: 60%;
	right: 0;
	height: calc(100% - 160px);
	z-index: 1;
	box-sizing: border-box;
	border-left: 1px solid var(--theme-border-muted);
}

.player {
	position: absolute;
	width: 60%;
	bottom: 0;
	right: 0;
	height: 160px;
	box-sizing: border-box;
	border-left: 1px solid var(--theme-border-muted);
	border-top: 1px solid var(--theme-border-muted);
}

.paneHeader {
	display: flex;
	flex-direction: column;
	width: inherit;
	position: fixed;
	height: 100px;
	z-index: 1;
	box-sizing: border-box;
	padding-left: 50px;
	padding-right: 50px;
	padding-top: 20px;
	padding-bottom: 10px;
	white-space: nowrap;
	overflow: hidden;
	border-bottom: 1px solid var(--theme-border-muted);
}

.paneContent {
	width: 100%;
	position: relative;
	height: calc(100% - 100px);
	top: 100px;
	padding-top: 50px;
	padding-left: 50px;
	padding-right: 50px;
	overflow-x: hidden;
	overflow-y: auto;
	box-sizing: border-box;
}

.viewActions {
	margin-bottom: 40px;
	font-size: 0;
}

.viewActions .header {
	line-height: 1;
	margin-bottom: 5px;
	font-size: 1.25rem;
	font-family: "Montserrat", "sans-serif";
}

.viewActions .subHeader {
	line-height: 1;
	font-size: 1.25rem;
	margin-bottom: 5px;
	color: var(--theme-foreground-muted);
}

.viewActions button {
	display: inline;
}
</style>
