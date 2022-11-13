<template>
	<div class="app">
		<Sidebar class="sidebar" />
		<div class="left-pane">
			<router-view></router-view>
		</div>
		<div class="right-pane">
			<Playlist />
			<Player />
		</div>
	</div>
</template>

<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Player from "./playback/Player.vue";
import Playlist from "./playback/Playlist.vue";
</script>

<style>
.app {
	display: flex;
	height: 100%;
}

.sidebar {
	width: 50px;
	flex-shrink: 0;
}

.left-pane {
	height: 100%;
	flex-shrink: 0;
	width: max(550px, min(900px, calc(40% - 50px)));
}

.right-pane {
	height: 100%;
	flex-grow: 1;
	z-index: 1;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	border-left: 1px solid var(--theme-border-muted);
}

.pane {
	height: 100%;
}

.player {
	height: 160px;
	box-sizing: border-box;
	border-top: 1px solid var(--theme-border-muted);
}

.pane,
.player {
	overflow-x: hidden;
}

.paneHeader {
	display: flex;
	flex-direction: column;
	width: 100%;
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
	height: calc(100% - 100px);
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
	font-size: 1.5rem;
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
