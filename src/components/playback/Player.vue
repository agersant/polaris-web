<template>
	<div class="relative flex items-center px-8 py-4 bg-ls-0 dark:bg-ds-900 whitespace-nowrap">
		<audio ref="htmlAudio" v-if="audioURL" v-bind:src="audioURL" @timeupdate="onTimeUpdate" @error="onPlaybackError"
			@ended="onEnded" @pause="onPaused" @playing="onPlaying" @waiting="onWaiting" />
		<PlayerAlbum class="basis-80 min-w-0 grow shrink" />
		<PlayerSong :seconds-played="secondsPlayed" :duration="duration" :progress="trackProgress" @seek="seekTo"
			class="grow-[8] basis-80 min-w-32 mx-16" />
		<PlayerControls class="basis-80 min-w-0 grow shrink" v-model:volume="volume" :paused="paused"
			:buffering="buffering" :error="error" @play="play" @pause="pause" @previous="skipPrevious"
			@next="skipNext" />
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, useTemplateRef, watch } from "vue";

import { makeAudioURL, makeThumbnailURL } from "@/api/endpoints";
import PlayerAlbum from "@/components/playback/PlayerAlbum.vue";
import PlayerControls from "@/components/playback/PlayerControls.vue";
import PlayerSong from "@/components/playback/PlayerSong.vue";
import notify from "@/notify";
import { usePlaybackStore } from "@/stores/playback";
import { useTimeoutPoll } from "@vueuse/core";
import { formatSong } from "@/format";

const playback = usePlaybackStore();

const secondsPlayed = ref(0);
const duration = ref(1);
const paused = ref(true);
const buffering = ref(false);
const error: Ref<string | null> = ref(null);
const htmlAudio = useTemplateRef("htmlAudio");

const audioURL = computed(() => playback.currentTrack ? makeAudioURL(playback.currentTrack.path) : null);
const artworkURL = computed(() => playback.currentSong && playback.currentSong.artwork ? makeThumbnailURL(playback.currentSong.artwork, "small") : null);

const volume = computed({
	get: () => playback.volume,
	set: (value) => playback.setVolume(value),
});

useTimeoutPoll(() => {
	if (htmlAudio.value) {
		secondsPlayed.value = htmlAudio.value.currentTime;
		duration.value = htmlAudio.value.duration || 1;
	}
}, 1000 / 60, { immediate: true });

const trackProgress = computed(() => {
	if (isNaN(duration.value)) {
		return 0;
	}
	if (duration.value == 0) {
		return 1;
	}
	return Math.max(0, Math.min(secondsPlayed.value / duration.value, 1));
});

watch(audioURL, playFromStart);

watch([volume, htmlAudio], () => {
	if (htmlAudio.value) {
		htmlAudio.value.volume = Math.pow(volume.value, 3);
	}
});

onMounted(() => {
	if (playback.elapsedSeconds && playback.elapsedSeconds > 0) {
		seekTo(playback.elapsedSeconds);
	}

	if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
		navigator.mediaSession.setActionHandler("previoustrack", skipPrevious);
		navigator.mediaSession.setActionHandler("nexttrack", skipNext);
	}
});

function playFromStart() {
	nextTick(async () => {
		if (!htmlAudio.value) {
			return;
		}
		error.value = null;
		paused.value = false;
		buffering.value = false;
		try {
			await htmlAudio.value.play();
			htmlAudio.value.currentTime = 0;
			playback.setScrobbleAllowed(true);
		} catch (e) {
			// https://developer.chrome.com/blog/play-request-was-interrupted/
			// This .play() promise will be rejected if we skip to a different
			// song while it is in progress.
		}
	});
}

function play() {
	if (!htmlAudio.value) {
		return;
	}
	htmlAudio.value.play();
	paused.value = false;
}

function pause() {
	if (!htmlAudio.value) {
		return;
	}
	htmlAudio.value.pause();
	paused.value = true;
	buffering.value = false;
}

async function skipPrevious() {
	const oldTrack = playback.currentTrack;
	const newTrack = await playback.previous();
	if (newTrack?.key == oldTrack?.key) {
		playFromStart();
	}
}

async function skipNext() {
	const oldTrack = playback.currentTrack;
	const newTrack = await playback.next();
	if (newTrack?.key == oldTrack?.key) {
		playFromStart();
	}
}

function seekTo(seconds: number) {
	if (!htmlAudio.value) {
		return;
	}
	htmlAudio.value.currentTime = seconds;
	playback.setScrobbleAllowed(false);
}

function onEnded(event: Event) {
	paused.value = true;
	buffering.value = false;
	skipNext();
}

function onPaused(event: Event) {
	buffering.value = false;
	paused.value = true;
}

function onPlaying(event: Event) {
	paused.value = false;
	buffering.value = false;
}

function onWaiting(event: Event) {
	paused.value = false;
	buffering.value = true;
}

function onTimeUpdate(event: Event) {
	if (!htmlAudio.value) {
		return;
	}
	playback.setDuration(htmlAudio.value.duration || 1);
	playback.setElapsedSeconds(htmlAudio.value.currentTime);
}

function onPlaybackError(event: Event) {
	const songInfo = playback.currentSong ? formatSong(playback.currentSong) : "Unknown Song";
	const errorPrefix = `'${songInfo}' could not be played because `;
	const mediaError = (event.target as HTMLAudioElement).error;
	if (!mediaError) {
		return;
	}
	let errorText;
	switch (mediaError.code) {
		case mediaError.MEDIA_ERR_NETWORK:
			errorText = errorPrefix + "of a network error.";
			break;
		case mediaError.MEDIA_ERR_DECODE:
			errorText = errorPrefix + "of a decoding error.";
			break;
		case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
			errorText = errorPrefix + "it is not a suitable source of audio.";
			break;
		default:
			errorText = errorPrefix + `of an unknown error ('${mediaError.code}').`;
			break;
	}
	pause();
	error.value = errorText;
	notify("Playback Error", artworkURL.value, errorText);
}
</script>
