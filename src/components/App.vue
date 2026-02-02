<template>
	<div class="h-full flex flex-col bg-ls-50 dark:bg-ds-800 select-none">
		<div class="flex flex-1 min-h-0 hidden lg:inline-flex">
			<Sidebar class="shrink-0 my-8" />
			<div class="grow grid grid-cols-2">
				<router-view class="px-8 xl:px-16 py-8 min-h-0" />
				<Playlist class="min-h-0 border-l border-ls-200 dark:border-ds-700" />
			</div>
		</div>
		<Player class="grow lg:grow-0 border-t border-ls-200 dark:border-ds-700" />
		<SidePanelSetup class="hidden lg:inline-flex" />
	</div>
</template>

<script setup lang="ts">
import SidePanelSetup from '@/components/basic/SidePanelSetup.vue';
import Sidebar from '@/components/Sidebar.vue';
import Player from '@/components/playback/Player.vue';
import Playlist from '@/components/playback/Playlist.vue';
</script>
