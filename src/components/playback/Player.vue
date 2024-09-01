<template>
	<div class="relative flex items-center px-8 py-4 bg-ls-0 dark:bg-ds-900 whitespace-nowrap select-none">
		<audio ref="htmlAudio" v-if="audioURL" v-bind:src="audioURL" @timeupdate="onTimeUpdate" @error="onPlaybackError"
			@ended="onEnded" @pause="onPaused" @playing="onPlaying" @waiting="onWaiting" />

		<PlayerAlbum class="basis-80 min-w-0 grow shrink" />

		<!-- Waveform -->
		<div class="grow-[8] basis-80 min-w-32 mx-16 flex flex-col gap-4">
			<div class="flex justify-center text-sm gap-1 text-ls-900">
				<span class="text-accent-600 underline">
					<span v-if="song && song.artists?.length">
						{{ formatArtists(song.artists) }}
					</span>
					<span v-else-if="song && song.album_artists?.length">{{ formatArtists(song.album_artists)
						}}</span>
				</span>
				<span>-</span>
				<span v-if="song" class="overflow-hidden text-ellipsis select-text">
					{{ formatTitle(song) }}
				</span>
				<span v-else-if="currentTrack" class="select-text">{{ getPathTail(currentTrack.path) }}</span>
				<span v-else class="mb-4 rounded-full w-40 h-3 bg-ls-200" />
			</div>
			<div class="flex grow items-center gap-4 text-xs text-ls-700">
				<div class="w-10 text-right">
					{{ currentTrack ? formatDuration(secondsPlayed) : "-:--" }}
				</div>
				<div id="waveform" class="grow" />
				<div class="w-10">
					{{ song && song.duration ? formatDuration(song.duration) : "-:--" }}
				</div>
			</div>

		</div>

		<PlayerControls class="basis-80 min-w-0 grow shrink" v-model:volume="volume" :paused="paused"
			:buffering="buffering" @play="play" @pause="pause" @restart="playFromStart" />

	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, Ref, ref, watch } from "vue";
import WaveSurfer from 'wavesurfer.js'

import { lastFMNowPlaying, lastFMScrobble, makeAudioURL, makeThumbnailURL } from "@/api/endpoints";
import PlayerAlbum from "@/components/playback/PlayerAlbum.vue";
import PlayerControls from "@/components/playback/PlayerControls.vue";
import { loadForCurrentUser, saveForCurrentUser } from "@/disk";
import { formatArtists, formatDuration, formatTitle, getPathTail } from "@/format";
import notify from "@/notify";
import { usePlaylistStore } from "@/stores/playlist";
import { usePreferencesStore } from "@/stores/preferences";
import { useSongsStore } from "@/stores/songs";

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

let wavesurfer: WaveSurfer | undefined;

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
	wavesurfer = WaveSurfer.create({
		container: '#waveform',
		height: 32,
		cursorWidth: 0,
		waveColor: "#e5e7eb", // TODO theming
		progressColor: "#46c8f1", // TODO theming
		media: htmlAudio.value as HTMLMediaElement,
		dragToSeek: true,
	})

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
	// TODO wavesurfer doesnt handle this!!
	// if (adjusting.value == "seek") {
	// 	adjusting.value = null;
	// }
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
		} catch (e) {
			// https://developer.chrome.com/blog/play-request-was-interrupted/
			// This .play() promise will be rejected if we skip to a different
			// song while it is in progress.
			return;
		}
		if (!htmlAudio.value) {
			return;
		}
		htmlAudio.value.currentTime = 0;
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
	if (newTrack == oldTrack) {
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
	const newTime = htmlAudio.value.currentTime;
	const newDuration = htmlAudio.value.duration || 1;
	secondsPlayed.value = newTime;
	duration.value = newDuration;
	if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
		navigator.mediaSession.setPositionState({
			position: newTime,
			duration: newDuration,
			playbackRate: 1,
		});
	}
	playlist.setElapsedSeconds(newTime);
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
