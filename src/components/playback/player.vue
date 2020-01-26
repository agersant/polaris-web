<template>
	<div class="player">
		<audio ref="htmlAudio" controls v-bind:src="trackURL"></audio>

		<div v-if="playlist.currentTrack" class="controls noselect">
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

		<div v-if="playlist.currentTrack" class="art">
			<img v-if="artworkURL" v-bind:src="artworkURL" />
		</div>

		<div class="currentTrack" v-if="playlist.currentTrack">
			<div class="trackInfo">
				<div class="primary">{{ trackInfoPrimary }}</div>
				<div class="secondary">{{ trackInfoSecondary }}</div>
			</div>
			<div class="seekBar" ref="seekInput" v-on:mousedown="seekMouseDown">
				<div class="fill" v-bind:style="{width: (100 * trackProgress) + '%'}"></div>
				<div class="head" v-bind:style="{left: (100 * trackProgress) + '%'}"></div>
			</div>
			<div v-if="playlist.currentTrack" class="trackDuration">{{ formattedPlaybackTime }}</div>
		</div>
	</div>
</template>


<script>
import { mapState } from "vuex";
import * as Utils from "/src/utils";
export default {
	data() {
		return {
			volume: 1,
			secondsPlayed: 0,
			mouseDown: false,
			adjusting: null,
			paused: true,
			canScrobble: false
		};
	},

	computed: {
		...mapState(["playlist"]),

		trackURL: function() {
			const currentTrack = this.playlist.currentTrack;
			if (!currentTrack) {
				return null;
			}
			return "api/serve/" + encodeURIComponent(currentTrack.info.path);
		},

		artworkURL: function() {
			const currentTrack = this.playlist.currentTrack;
			if (!currentTrack && currentTrack.info.artwork) {
				return null;
			}
			return "api/serve/" + encodeURIComponent(currentTrack.info.artwork);
		},

		formattedPlaybackTime: function() {
			const minutes = Math.floor(this.secondsPlayed / 60);
			let seconds = Math.floor(this.secondsPlayed) - 60 * minutes;
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			return minutes + ":" + seconds;
		},

		trackProgress: function() {
			if (!this.$refs.htmlAudio) {
				return 0;
			}
			const duration = this.$refs.htmlAudio.duration;
			return this.secondsPlayed / duration;
		},

		trackInfoPrimary() {
			const track = this.playlist.currentTrack;
			let result = track.info.artist ? track.info.artist : "Unknown Artist";
			result += " - ";
			result += track.info.title || utils.stripFileExtension(utils.getPathTail(track.info.path));
			return result;
		},

		trackInfoSecondary() {
			const track = this.playlist.currentTrack;
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

	mounted() {
		/* TODO
		var volume = utils.loadUserData("volume");
		if (volume) {
			this.$refs.htmlAudio.volume = volume;
		}*/

		this.$refs.htmlAudio.addEventListener("ended", this.skipNext);

		this.$refs.htmlAudio.addEventListener("pause", () => {
			if (!this.$refs.htmlAudio) {
				return;
			}
			this.paused = this.$refs.htmlAudio.paused;
		});

		this.$refs.htmlAudio.addEventListener("playing", () => {
			this.paused = this.$refs.htmlAudio.paused;
		});

		this.$refs.htmlAudio.addEventListener("volumechange", () => {
			this.volume = this.$refs.htmlAudio.volume;
			// utils.saveUserData("volume", this.volume); TODO
		});

		this.$refs.htmlAudio.addEventListener("timeupdate", () => {
			if (!this.$refs.htmlAudio) {
				return;
			}
			const currentTime = this.$refs.htmlAudio.currentTime;
			const duration = this.$refs.htmlAudio.duration;
			this.secondsPlayed = currentTime;
			if (navigator.mediaSession && navigator.mediaSession.setPositionState) {
				navigator.mediaSession.setPositionState({
					position: currentTime,
					duration: duration,
					playbackRate: 1
				});
			}
			this.updateScrobble();
		});

		this.$refs.htmlAudio.addEventListener("error", event => {
			var errorText = "'" + trackInfoPrimary + "' could not be played because ";
			var artwork = artworkURL || null;

			const error = event.target.error;
			switch (error.code) {
				case error.MEDIA_ERR_NETWORK:
					notify.spawn("Playback Error", artwork, errorText + "of a network error.");
					break;
				case error.MEDIA_ERR_DECODE:
					notify.spawn("Playback Error", artwork, errorText + "of a decoding error.");
					break;
				case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					notify.spawn("Playback Error", artwork, errorText + "it is not a suitable source of audio.");
					break;
				default:
					console.log("Unexpected playback error: " + error.code);
					break;
			}
			this.skipNext();
		});

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
		togglePlay() {
			if (this.$refs.htmlAudio.paused) {
				this.$refs.htmlAudio.play();
			} else {
				this.$refs.htmlAudio.pause();
			}
			this.paused = this.$refs.htmlAudio.paused;
		},

		skipPrevious() {
			this.$store.commit("playlist/advance", -1);
		},

		skipNext() {
			this.$store.commit("playlist/advance", 1);
		},

		updateScrobble() {
			var currentTime = this.$refs.htmlAudio.currentTime;
			var duration = this.$refs.htmlAudio.duration;
			if (this.canScrobble) {
				var shouldScrobble = duration > 30 && (currentTime > duration / 2 || currentTime > 4 * 60);
				if (shouldScrobble) {
					Utils.api("/lastfm/scrobble/" + encodeURIComponent(this.playlist.currentTrack.info.path), { method: "POST" });
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
				this.$refs.htmlAudio.currentTime = progress * this.$refs.htmlAudio.duration;
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
				let volume = Math.min(Math.max(x / this.$refs.volumeInput.offsetWidth, 0), 1);
				this.$refs.htmlAudio.volume = volume;
			}
		}
	}
};
/*
	jumpTo(track) {
		this.currentTrack = track;
		this.albumArt = track.info.artworkURL;
		this.trackURL = track.info.url;
		if (navigator.mediaSession && MediaMetadata) {
			var metadata = new MediaMetadata({
				title: track.info.title,
				artist: track.info.artist,
				album: track.info.album,
			});
			if (track.info.artworkURL) {
				metadata.artwork = [{ src: track.info.artworkURL }];
			}
			navigator.mediaSession.metadata = metadata;
		}
		this.update();
		eventBus.trigger("player:playing", this.currentTrack);
	}

	onTrackQueued(newTrack) {
		if (!this.currentTrack) {
			this.jumpTo(newTrack);
		}
	}

	play(track) {
		this.jumpTo(track);
		this.$refs.htmlAudio.play();
		utils.api("/lastfm/now_playing/" + encodeURIComponent(track.info.path), { method: "PUT" });
		this.canScrobble = true;
	}

	eventBus.on("playlist:queued", this.onTrackQueued);
	eventBus.on("playlist:jumpTo", this.jumpTo);
	eventBus.on("playlist:play", this.play);
	*/
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
	border-radius: 5px;
}

.art img {
	width: 100%;
	height: 100%;
	border-radius: 5px;
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