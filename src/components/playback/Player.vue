<template>
	<div class="player">
		<audio ref="htmlAudio" controls v-if="trackURL" v-bind:src="trackURL" @timeupdate="onTimeUpdate"
			@error="onPlaybackError" @ended="onEnded" @pause="onPaused" @playing="onPlaying"
			@waiting="onWaiting"></audio>

		<div v-if="currentTrack" class="controls noselect">
			<div class="playback">
				<div class="control previous" v-on:click="skipPrevious">
					<i class="material-icons md-18">skip_previous</i>
				</div>
				<div v-if="paused" class="control play" v-on:click="togglePlay">
					<i class="material-icons">play_arrow</i>
				</div>
				<div v-if="!paused" class="control pause" v-on:click="togglePlay">
					<i class="material-icons">pause</i>
				</div>
				<div class="control next" v-on:click="skipNext">
					<i class="material-icons md-18">skip_next</i>
				</div>
			</div>
			<div class="volume">
				<div class="icon" v-on:click="toggleMute">
					<i v-if="volume == 0" class="material-icons">volume_off</i>
					<i v-if="volume > 0" class="material-icons">volume_down</i>
				</div>
				<div class="bar" ref="volumeInput" v-on:mousedown="volumeMouseDown">
					<div class="fill" v-bind:style="{ width: 100 * volume + '%' }"></div>
				</div>
			</div>
		</div>

		<div v-if="currentTrack" class="art">
			<CoverArt v-if="artworkURL" v-bind:url="artworkURL" />
			<div v-if="!artworkURL" class="missing-art"></div>
		</div>

		<div class="currentTrack" v-if="currentTrack">
			<div class="trackInfo">
				<div class="primary">
					<Spinner class="spinner" v-if="debouncedBuffering" />{{ trackInfoPrimary }}
				</div>
				<div class="secondary">{{ trackInfoSecondary }}</div>
			</div>
			<div class="seekBar" ref="seekInput" v-on:mousedown="seekMouseDown">
				<div class="fill" v-bind:style="{ width: 100 * trackProgress + '%' }"></div>
				<div class="head" v-bind:style="{ left: 100 * trackProgress + '%' }"></div>
			</div>
			<div v-if="currentTrack" class="trackDuration">{{ formatDuration(secondsPlayed) }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import { refDebounced } from "@vueuse/core";
import notify from "@/notify";
import { loadForCurrentUser, saveForCurrentUser } from "@/disk";
import { lastFMNowPlaying, lastFMScrobble, makeAudioURL, makeThumbnailURL } from "@/api/endpoints";
import { usePlaylistStore } from "@/stores/playlist";
import { usePreferencesStore } from "@/stores/preferences";
import { formatDuration, formatTitle } from "@/format";
import CoverArt from "@/components/CoverArt.vue";
import Spinner from "@/components/Spinner.vue";

const playlist = usePlaylistStore();
const preferences = usePreferencesStore();

const volume = ref(1);
const unmutedVolume = ref(1);
const secondsPlayed = ref(0);
const duration = ref(1);
const adjusting: Ref<"volume" | "seek" | null> = ref(null);
const paused = ref(true);
const buffering = ref(false);
const debouncedBuffering = refDebounced(buffering, 100);
const canScrobble = ref(false);
const mounted = ref(false);
const htmlAudio: Ref<HTMLAudioElement | null> = ref(null);
const seekInput: Ref<HTMLElement | null> = ref(null);
const volumeInput: Ref<HTMLElement | null> = ref(null);

const currentTrack = computed(() => playlist.currentTrack);
const trackURL = computed(() => currentTrack.value ? makeAudioURL(currentTrack.value.path) : null);
const artworkURL = computed(() => currentTrack.value && currentTrack.value.artwork ? makeThumbnailURL(currentTrack.value.artwork) : null);

const trackProgress = computed(() => {
	if (isNaN(duration.value)) {
		return 0;
	}
	if (duration.value == 0) {
		return 1;
	}
	return Math.max(0, Math.min(secondsPlayed.value / duration.value, 1));
});

const trackInfoPrimary = computed(() => {
	const track = currentTrack.value;
	if (!track) {
		return "";
	}
	let result = track.artist ? track.artist : "Unknown Artist";
	result += " - ";
	result += formatTitle(track);
	return result;
});

const trackInfoSecondary = computed(() => {
	const track = currentTrack.value;
	if (!track) {
		return "";
	}
	let result = track.album || "Unknown Album";
	if (track.year) {
		result += " (" + track.year + ")";
	}
	if (track.track_number) {
		result += " #" + track.track_number;
	}
	return result;
});

watch(currentTrack, (to, from) => {
	if (!mounted.value) {
		return;
	}
	handleCurrentTrackChanged();
	playFromStart();
});

watch(volume, (to, from) => {
	if (htmlAudio.value) {
		htmlAudio.value.volume = Math.pow(to, 3);
	}
	saveForCurrentUser("volume", to);
});

onBeforeUnmount(() => {
	mounted.value = false;
});

onMounted(() => {
	mounted.value = true;

	const savedVolume = parseFloat(loadForCurrentUser("volume"));
	if (!isNaN(savedVolume)) {
		volume.value = savedVolume;
		if (savedVolume > 0) {
			unmutedVolume.value = savedVolume;
		}
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

	// Global mouse handling
	let onMouseMove = (event: MouseEvent) => {
		if (event.buttons != undefined) {
			const isLeftClickDown = (event.buttons & 1) == 1;
			if (!isLeftClickDown) {
				return;
			}
		}
		if (adjusting.value == "volume") {
			volumeMouseMove(event);
		} else if (adjusting.value == "seek") {
			seekMouseMove(event);
		}
	};

	document.body.addEventListener("mousemove", onMouseMove);
	document.body.addEventListener("mousedown", onMouseMove);
	document.body.addEventListener("mouseup", () => {
		if (adjusting.value == "volume" && volume.value != 0) {
			unmutedVolume.value = volume.value;
		}
		adjusting.value = null;
	});
});

function handleCurrentTrackChanged() {
	if (adjusting.value == "seek") {
		adjusting.value = null;
	}
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
			title: track.title || undefined,
			artist: track.artist || undefined,
			album: track.album || undefined,
		});
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
	let windowTitle = track.artist ? track.artist : "Unknown Artist";
	windowTitle += " - ";
	windowTitle += formatTitle(track);
	document.title = windowTitle;
}

function toggleMute() {
	if (volume.value != 0) {
		volume.value = 0;
	} else {
		volume.value = unmutedVolume.value;
	}
}

function togglePlay() {
	if (!htmlAudio.value) {
		return;
	}
	if (paused.value) {
		htmlAudio.value.play();
		paused.value = false;
	} else {
		htmlAudio.value.pause();
		paused.value = true;
		buffering.value = false;
	}
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

function seekMouseDown() {
	adjusting.value = "seek";
}

function volumeMouseDown() {
	adjusting.value = "volume";
}

function seekMouseMove(event: MouseEvent) {
	if (adjusting.value == "seek" && seekInput.value) {
		let x = event.pageX;
		let o: HTMLElement | null = seekInput.value;
		while (o) {
			x -= o.offsetLeft;
			o = o.offsetParent as (HTMLElement | null);
		}
		let progress = Math.min(Math.max(x / seekInput.value.offsetWidth, 0), 1);
		seekTo(progress * duration.value);
	}
}

function seekTo(seconds: number) {
	if (!htmlAudio.value) {
		return;
	}
	htmlAudio.value.currentTime = seconds;
	canScrobble.value = false;
}

function volumeMouseMove(event: MouseEvent) {
	if (adjusting.value == "volume" && volumeInput.value) {
		let x = event.pageX;
		let o: HTMLElement | null = volumeInput.value;
		while (o) {
			x -= o.offsetLeft;
			o = o.offsetParent as (HTMLElement | null);
		}
		volume.value = Math.min(Math.max(x / volumeInput.value.offsetWidth, 0), 1);
	}
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
	if (!mounted.value || !htmlAudio.value) {
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

<style scoped>
.player {
	padding: 40px;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

audio {
	display: none;
}

.art {
	width: 120px;
	height: 120px;
	position: relative;
}

.missing-art {
	height: 100%;
	border-radius: 5px;
	background: repeating-linear-gradient(-45deg, var(--theme-background-muted), var(--theme-background-muted) 8px, var(--theme-background) 8px, var(--theme-background) 16px);
}

.currentTrack {
	flex-grow: 1;
	padding-left: 20px;
}

.controls {
	margin-right: 20px;
	width: 120px;
	cursor: default;
}

.controls .playback {
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	align-items: center;
}

.control {
	border-radius: 50%;
	border: 1px solid var(--theme-border);
	text-align: center;
}

.control.previous,
.control.next {
	width: 28px;
	height: 28px;
	line-height: 28px;
	padding-top: 4px;
	box-sizing: border-box;
}

.control.play,
.control.pause {
	padding-top: 6px;
	width: 40px;
	height: 40px;
	line-height: 40px;
	box-sizing: border-box;
}

.volume {
	margin-left: -4px;
	display: flex;
	flex-flow: row nowrap;
}

.volume .bar {
	flex-grow: 1;
	background-color: var(--theme-foreground-muted);
	height: 10px;
	margin: 7px 0;
	border-radius: 3px;
}

.volume .fill {
	height: 100%;
	max-width: 100%;
	background-color: var(--theme-accent);
	border-radius: 3px;
}

.trackInfo .primary {
	font-weight: 600;
	margin-bottom: -5px;
}

.spinner {
	margin-bottom: -2px;
	margin-right: 8px;
}

.trackInfo .secondary,
.trackDuration {
	font-weight: 300;
	font-size: 0.875rem;
}

.seekBar {
	width: 100%;
	background-color: var(--theme-foreground-muted);
	height: 10px;
	margin: 6px 0;
	border-radius: 3px;
}

.seekBar .fill {
	height: 100%;
	width: 0;
	max-width: 100%;
	background-color: var(--theme-accent);
	border-radius: 3px;
}

.seekBar .head {
	width: 16px;
	height: 16px;
	position: relative;
	top: -14px;
	margin-left: -9px;
	background-color: var(--theme-background);
	border: 1px solid var(--theme-border);
	border-radius: 3px;
}

.controls,
.art img,
.currentTrack {
	animation-duration: 250ms;
	animation-name: fadein;
}

@keyframes fadein {
	from {
		margin-top: 100px;
		transform: scale(0);
		opacity: 0;
	}

	to {
		margin-top: 0;
		transform: scale(1);
		opacity: 1;
	}
}
</style>