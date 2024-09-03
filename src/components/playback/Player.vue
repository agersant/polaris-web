<template>
	<div class="relative flex items-center px-8 py-4 bg-ls-0 dark:bg-ds-900 whitespace-nowrap select-none">
		<audio ref="htmlAudio" v-if="audioURL" v-bind:src="audioURL" @timeupdate="onTimeUpdate" @error="onPlaybackError"
			@ended="onEnded" @pause="onPaused" @playing="onPlaying" @waiting="onWaiting" />
		<PlayerAlbum class="basis-80 min-w-0 grow shrink" />
		<PlayerSong :seconds-played="secondsPlayed" :duration="duration" :progress="trackProgress" @seek="seekTo"
			class="grow-[8] basis-80 min-w-32 mx-16" />
		<PlayerControls class="basis-80 min-w-0 grow shrink" v-model:volume="volume" :paused="paused"
			:buffering="buffering" @play="play" @pause="pause" @restart="playFromStart" />
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";

import { lastFMNowPlaying, lastFMScrobble, makeAudioURL, makeThumbnailURL } from "@/api/endpoints";
import PlayerAlbum from "@/components/playback/PlayerAlbum.vue";
import PlayerControls from "@/components/playback/PlayerControls.vue";
import PlayerSong from "@/components/playback/PlayerSong.vue";
import { loadForCurrentUser, saveForCurrentUser } from "@/disk";
import { formatArtists, formatTitle } from "@/format";
import notify from "@/notify";
import { usePlaylistStore } from "@/stores/playlist";
import { usePreferencesStore } from "@/stores/preferences";
import { useSongsStore } from "@/stores/songs";
import { useTimeoutPoll } from "@vueuse/core";

const playlist = usePlaylistStore();
const songs = useSongsStore();
const preferences = usePreferencesStore();

const volume = ref(1);
const secondsPlayed = ref(0);
const duration = ref(1);
const paused = ref(true);
const buffering = ref(false);
const canScrobble = ref(false);
const htmlAudio: Ref<HTMLAudioElement | null> = ref(null);

const currentTrack = computed(() => playlist.currentTrack);

const song = computed(() => {
	if (!currentTrack.value) {
		return undefined;
	}
	return songs.cache.get(currentTrack.value.path)
});

const audioURL = computed(() => currentTrack.value ? makeAudioURL(currentTrack.value.path) : null);
const artworkURL = computed(() => song.value && song.value.artwork ? makeThumbnailURL(song.value.artwork, "small") : null);

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

watch(audioURL, () => {
	handleCurrentTrackChanged();
	playFromStart();
});

watch([volume, htmlAudio], () => {
	if (htmlAudio.value) {
		htmlAudio.value.volume = Math.pow(volume.value, 3);
	}
	saveForCurrentUser("volume", volume.value);
});

onMounted(() => {
	const savedVolume = parseFloat(loadForCurrentUser("volume"));
	if (!isNaN(savedVolume)) {
		volume.value = savedVolume;
	}

	if (currentTrack.value) {
		handleCurrentTrackChanged();
	}

	if (playlist.elapsedSeconds && playlist.elapsedSeconds > 0) {
		seekTo(playlist.elapsedSeconds);
	}

	if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
		navigator.mediaSession.setActionHandler("previoustrack", skipPrevious);
		navigator.mediaSession.setActionHandler("nexttrack", skipNext);
	}
});

function handleCurrentTrackChanged() {
	canScrobble.value = true;
	updateMediaSession();
	updateWindowTitle();
	if (currentTrack.value && preferences.lastFMUsername) {
		lastFMNowPlaying(currentTrack.value.path);
	}
}

function playFromStart() {
	nextTick(async () => {
		if (!htmlAudio.value) {
			return;
		}
		paused.value = false;
		buffering.value = false;
		try {
			await htmlAudio.value.play();
			htmlAudio.value.currentTime = 0;
		} catch (e) {
			// https://developer.chrome.com/blog/play-request-was-interrupted/
			// This .play() promise will be rejected if we skip to a different
			// song while it is in progress.
		}
	});
}

function updateMediaSession() {
	if (navigator.mediaSession && MediaMetadata) {
		const track = currentTrack.value;
		if (!track) {
			return;
		}
		let metadata = new MediaMetadata({
			title: track.title,
			album: track.album,
		});
		if (track.artists) {
			metadata.artist = formatArtists(track.artists);
		}
		if (artworkURL.value) {
			metadata.artwork = [{ src: artworkURL.value }];
		}
		navigator.mediaSession.metadata = metadata;
	}
}

function updateWindowTitle() {
	const track = currentTrack.value;
	if (!track) {
		return;
	}
	let windowTitle = formatArtists(track.artists || []) || "Unknown Artist";
	windowTitle += " - ";
	windowTitle += formatTitle(track);
	document.title = windowTitle;
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
	const oldTrack = currentTrack.value;
	const newTrack = await playlist.previous();
	if (newTrack == oldTrack) {
		handleCurrentTrackChanged();
		playFromStart();
	}
}

async function skipNext() {
	const oldTrack = currentTrack.value;
	const newTrack = await playlist.next();
	if (newTrack?.key == oldTrack?.key) {
		handleCurrentTrackChanged();
		playFromStart();
	}
}

function updateScrobble() {
	if (!canScrobble.value || !currentTrack.value) {
		return;
	}
	const shouldScrobble = preferences.lastFMUsername && duration.value > 30 && (trackProgress.value > 0.5 || secondsPlayed.value > 4 * 60);
	if (shouldScrobble) {
		lastFMScrobble(currentTrack.value.path);
		canScrobble.value = false;
	}
}

function seekTo(seconds: number) {
	if (!htmlAudio.value) {
		return;
	}
	htmlAudio.value.currentTime = seconds;
	canScrobble.value = false;
}

function onEnded(event: Event) {
	paused.value = true;
	buffering.value = false;
	skipNext();
}

function onPaused(event: Event) {
	buffering.value = false;
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
	const position = htmlAudio.value.currentTime;
	const duration = htmlAudio.value.duration || 1;
	if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
		navigator.mediaSession.setPositionState({
			position,
			duration,
			playbackRate: 1,
		});
	}
	playlist.setElapsedSeconds(position);
	updateScrobble();
}

function onPlaybackError(event: Event) {
	const errorText = "'" + trackInfoPrimary.value + "' could not be played because ";
	const error = (event.target as HTMLAudioElement).error;
	if (!error) {
		return;
	}
	switch (error.code) {
		case error.MEDIA_ERR_NETWORK:
			notify("Playback Error", artworkURL.value, errorText + "of a network error.");
			break;
		case error.MEDIA_ERR_DECODE:
			notify("Playback Error", artworkURL.value, errorText + "of a decoding error.");
			break;
		case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
			notify("Playback Error", artworkURL.value, errorText + "it is not a suitable source of audio.");
			break;
		default:
			console.log("Unexpected playback error: " + error.code);
			break;
	}
	paused.value = true;
	skipNext();
}
</script>
