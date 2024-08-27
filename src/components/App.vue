<template>
	<div class="h-full flex flex-col bg-ls-50 dark:bg-ds-900">
		<div class="flex flex-1 min-h-0">
			<Sidebar class="shrink-0 m-8 mr-0" />

			<div class="grow grid grid-cols-2">
				<router-view class="px-20 py-8 min-h-0" />
				<Playlist class="min-h-0" />
			</div>
		</div>
		<div class="px-8 border-t flex-none flex items-center gap-16 bg-ls-0">
			<div class="flex">
				<div class="aspect-square h-20 rounded-md bg-pink-400" />
				<div class="ml-4 flex flex-col justify-center">
					<div class="font-semibold">No Turning Back</div>
					<div class="text-sm text-muted-color">Stratovarius</div>
				</div>
			</div>
			<div class="flex gap-4 items-center text-muted-color">
				<span class="material-icons-round text-4xl">skip_previous</span>
				<div class="material-icons-round text-2xl rounded-full p-2 border-4 px-3">pause</div>
				<span class="material-icons-round text-4xl">skip_next</span>
			</div>
			<div class="grow flex items-center gap-4 text-muted-color text-xs">
				<span>0:24</span>
				<div id="waveform" class="grow" />
				<span>5:46</span>
			</div>
			<div class="flex items-center gap-4">
				<span class="material-icons-round">volume_down</span>
				<Slider class="w-32" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WaveSurfer from 'wavesurfer.js'

import { makeAudioURL } from '@/api/endpoints';
import Sidebar from './Sidebar.vue';
import Playlist from './playback/Playlist.vue';

onMounted(() => {
	// TODO major hitch when agressively resizing browser window horizontally
	WaveSurfer.create({
		container: '#waveform',
		url: makeAudioURL("root/Jazz/Casiopea/1981 - Cross Point/02 - Swear.mp3"),
		// waveColor: $dt("text.muted.color").value.light.value,
		// progressColor: $dt("primary.color").value.light.value,
		height: 112,
		barWidth: 3,
		barGap: 2,
		barRadius: 4,
		barHeight: 0.5,
		cursorWidth: 0,
	})
});
</script>
