<template>
	<div class="h-full flex flex-col bg-ls-50 dark:bg-ds-800 select-none">
		<div class="flex flex-1 min-h-0">
			<Sidebar class="shrink-0 m-8 mr-0" />
			<div class="grow grid grid-cols-2">
				<router-view class="px-16 py-8 min-h-0" />
				<Playlist class="min-h-0" />
			</div>
		</div>
		<Player class="border-t border-ls-200 dark:border-ds-700" />
	</div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue';
import Player from './playback/Player.vue';
import Playlist from './playback/Playlist.vue';
</script>
