<template>
	<div>
		<sidebar class="sidebar"></sidebar>
		<router-view></router-view>
		<!--
    <router>
      <route path="settings/*">
        <settings />
      </route>
      <route path="playlists..">
        <playlists />
      </route>
      <route path="..">
        <browser />
      </route>
    </router>
    <playlist />
    <player />
		<window-title-updater />-->
	</div>
</template>

<script>
import * as Utils from "/src/utils";
import * as Theming from "/src/theming/theming";
import Sidebar from "./sidebar";

export default {
	components: {
		sidebar: Sidebar
	},
	mounted() {
		this.applyTheme();
	},
	methods: {
		applyTheme() {
			Utils.api("/preferences")
				.then(function(res) {
					return res.json();
				})
				.then(data => {
					Theming.setBase(data.web_theme_base);
					Theming.setAccentColor(data.web_theme_accent);
				});
		}
	}
};
</script>

<style>
.playlist,
.browser,
.settings,
.search,
.playlists,
.player {
	overflow-x: hidden;
	background-color: var(--theme-background);
}

.sidebar {
	position: absolute;
	width: 50px;
	height: 100%;
}

.browser,
.settings,
.search,
.playlists {
	position: absolute;
	width: calc(40% - 50px);
	left: 50px;
	height: 100%;
}

.playlist {
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
	padding-left: 50px;
	padding-right: 50px;
	overflow-x: hidden;
	overflow-y: auto;
	box-sizing: border-box;
}
</style>
