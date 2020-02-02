<template>
	<div class="player">
		<audio
			ref="htmlAudio"
			controls
			v-bind:src="trackURL"
			v-on:timeupdate="onTimeUpdate"
			v-on:error="onPlaybackError"
			v-on:ended="skipNext"
			v-on:pause="onPaused"
			v-on:playing="onPlaying"
		></audio>

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
				<div class="icon">
					<i v-if="volume == 0" class="material-icons">volume_off</i>
					<i v-if="volume > 0" class="material-icons">volume_down</i>
				</div>
				<div class="bar" ref="volumeInput" v-on:mousedown="volumeMouseDown">
					<div class="fill" v-bind:style="{width: (100 * volume) + '%'}"></div>
				</div>
			</div>
		</div>

		<div v-if="currentTrack" class="art">
			<cover-art v-if="artworkURL" v-bind:url="artworkURL"></cover-art>
		</div>

		<div class="currentTrack" v-if="currentTrack">
			<div class="trackInfo">
				<div class="primary">{{ trackInfoPrimary }}</div>
				<div class="secondary">{{ trackInfoSecondary }}</div>
			</div>
			<div class="seekBar" ref="seekInput" v-on:mousedown="seekMouseDown">
				<div class="fill" v-bind:style="{width: (100 * trackProgress) + '%'}"></div>
				<div class="head" v-bind:style="{left: (100 * trackProgress) + '%'}"></div>
			</div>
			<div v-if="currentTrack" class="trackDuration">{{ formattedPlaybackTime }}</div>
		</div>
	</div>
</template>


<script>
import Vue from "vue";
import { mapState } from "vuex";
import API from "/src/api";
import Disk from "/src/disk";
import * as Format from "/src/format";
import notify from "/src/notify";
import CoverArt from "/src/components/cover-art";
export default {
	components: {
		"cover-art": CoverArt
	},

	data() {
		return {
			volume: 1,
			secondsPlayed: 0,
			duration: 1,
			mouseDown: false,
			adjusting: null,
			paused: true,
			canScrobble: false
		};
	},

	computed: {
		...mapState(["playlist"]),

		currentTrack: function() {
			return this.playlist.currentTrack;
		},

		trackURL: function() {
			if (!this.currentTrack) {
				return null;
			}
			return "api/serve/" + encodeURIComponent(this.currentTrack.info.path);
		},

		artworkURL: function() {
			if (!this.currentTrack && this.currentTrack.info.artwork) {
				return null;
			}
			return "api/serve/" + encodeURIComponent(this.currentTrack.info.artwork);
		},

		formattedPlaybackTime: function() {
			return Format.duration(this.secondsPlayed);
		},

		trackProgress: function() {
			if (isNaN(this.duration)) {
				return 0;
			}
			if (this.duration == 0) {
				return 1;
			}
			return this.secondsPlayed / this.duration;
		},

		trackInfoPrimary() {
			const track = this.currentTrack;
			let result = track.info.artist ? track.info.artist : "Unknown Artist";
			result += " - ";
			result += Format.title(track.info);
			return result;
		},

		trackInfoSecondary() {
			const track = this.currentTrack;
			let result = track.info.album || "Unknown Album";
			if (track.info.year) {
				result += " (" + track.info.year + ")";
			}
			if (track.info.track_number) {
				result += " #" + track.info.track_number;
			}
			return result;
		}
	},

	watch: {
		currentTrack(to, from) {
			if (this.invalid) {
				return;
			}
			this.handleCurrentTrackChanged();
			if (from) {
				Vue.nextTick(() => {
					this.$refs.htmlAudio
						.play()
						.then(() => {
							this.secondsPlayed = 0;
							API.lastFMNowPlaying(to.info.path);
						})
						.catch(() => {})
						.finally(() => {
							this.paused = this.$refs.htmlAudio.paused;
						});
				});
			}
		},

		volume(to, from) {
			this.$refs.htmlAudio.volume = to;
			Disk.save("volume", to);
		}
	},

	beforeDestroy() {
		this.invalid = true;
	},

	mounted() {
		var volume = Disk.load("volume");
		if (volume) {
			this.volume = volume;
		}

		if (navigator.mediaSession && navigator.mediaSession.setActionHandler) {
			navigator.mediaSession.setActionHandler("previoustrack", this.skipPrevious);
			navigator.mediaSession.setActionHandler("nexttrack", this.skipNext);
		}

		// Global mouse handling
		let onMouseMove = event => {
			if (!this.mouseDown) {
				return;
			}
			if (this.adjusting == "volume") {
				this.volumeMouseMove(event);
			} else if (this.adjusting == "seek") {
				this.seekMouseMove(event);
			}
		};

		document.body.addEventListener("mousemove", onMouseMove);
		document.body.addEventListener("mousedown", event => {
			this.mouseDown = true;
			onMouseMove(event);
		});
		document.body.addEventListener("mouseup", () => {
			this.mouseDown = false;
			this.adjusting = null;
		});
	},

	methods: {
		handleCurrentTrackChanged() {
			if (this.adjusting == "seek") {
				this.adjusting = null;
			}
			this.canScrobble = true;
			this.updateMediaSession();
			this.updateWindowTitle();
		},

		updateMediaSession() {
			if (navigator.mediaSession && MediaMetadata) {
				const track = this.currentTrack;
				var metadata = new MediaMetadata({
					title: track.info.title,
					artist: track.info.artist,
					album: track.info.album
				});
				if (this.artworkURL) {
					metadata.artwork = [{ src: this.artworkURL }];
				}
				navigator.mediaSession.metadata = metadata;
			}
		},

		updateWindowTitle() {
			const info = this.currentTrack.info;
			let trackInfo = info.artist ? info.artist : "Unknown Artist";
			trackInfo += " - ";
			trackInfo += Format.title(info);
			document.title = trackInfo;
		},

		togglePlay() {
			if (this.$refs.htmlAudio.paused) {
				this.$refs.htmlAudio
					.play()
					.catch(() => {})
					.finally(() => {
						this.paused = this.$refs.htmlAudio.paused;
					});
			} else {
				this.$refs.htmlAudio.pause();
			}
		},

		skipPrevious() {
			this.$store.dispatch("playlist/previous");
		},

		skipNext() {
			this.$store.dispatch("playlist/next");
		},

		updateScrobble() {
			if (this.canScrobble) {
				var shouldScrobble = this.duration > 30 && (this.trackProgress > 0.5 || this.secondsPlayed > 4 * 60);
				if (shouldScrobble) {
					API.lastFMScrobble(this.currentTrack.info.path);
					this.canScrobble = false;
				}
			}
		},

		seekMouseDown() {
			this.adjusting = "seek";
		},

		volumeMouseDown() {
			this.adjusting = "volume";
		},

		seekMouseMove(event) {
			if (this.mouseDown && this.adjusting == "seek") {
				let x = event.pageX;
				let o = this.$refs.seekInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				let progress = Math.min(Math.max(x / this.$refs.seekInput.offsetWidth, 0), 1);
				this.$refs.htmlAudio.currentTime = progress * this.duration;
				this.canScrobble = false;
			}
		},

		volumeMouseMove(event) {
			if (this.mouseDown && this.adjusting == "volume") {
				let x = event.pageX;
				let o = this.$refs.volumeInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				this.volume = Math.min(Math.max(x / this.$refs.volumeInput.offsetWidth, 0), 1);
			}
		},

		onPaused(event) {
			this.paused = event.target.paused;
		},

		onPlaying(event) {
			this.paused = event.target.paused;
		},

		onTimeUpdate(event) {
			if (this.invalid) {
				return;
			}
			const htmlAudio = event.target;
			const currentTime = htmlAudio.currentTime;
			const duration = htmlAudio.duration;
			this.secondsPlayed = currentTime;
			this.duration = duration;
			if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
				navigator.mediaSession.setPositionState({
					position: currentTime,
					duration: duration,
					playbackRate: 1
				});
			}
			this.updateScrobble();
		},

		onPlaybackError(event) {
			var errorText = "'" + this.trackInfoPrimary + "' could not be played because ";
			var artwork = this.artworkURL || null;
			const error = event.target.error;
			switch (error.code) {
				case error.MEDIA_ERR_NETWORK:
					notify("Playback Error", artwork, errorText + "of a network error.");
					break;
				case error.MEDIA_ERR_DECODE:
					notify("Playback Error", artwork, errorText + "of a decoding error.");
					break;
				case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					notify("Playback Error", artwork, errorText + "it is not a suitable source of audio.");
					break;
				default:
					console.log("Unexpected playback error: " + error.code);
					break;
			}
			this.skipNext();
		}
	}
};
</script>

<style scoped>
.player {
	padding: 40px;
	display: flex;
	flex-flow: row nowrap;
	align-items: center;
	justify-content: center;
}

audio {
	display: none;
}

.art {
	width: 120px;
	height: 120px;
	position: relative;
}

.currentTrack {
	flex-grow: 1;
	min-width: 200px;
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