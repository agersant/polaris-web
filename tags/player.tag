<player>

	<audio ref="htmlAudio" controls src="{ trackURL }"/>

	<div  if="{ currentTrack }" class="controls noselect">
		<div class="playback">
			<div class="control previous" onclick={ skipPrevious }><i class="material-icons md-18">skip_previous</i></div>
			<div if={ paused } class="control play" onclick={ togglePlay }><i class="material-icons">play_arrow</i></div>
			<div if={ !paused } class="control pause" onclick={ togglePlay }><i class="material-icons">pause</i></div>
			<div class="control next" onclick={ skipNext }><i class="material-icons md-18">skip_next</i></div>
		</div>
		<div class="volume">
			<div class="icon">
				<i if={ volume == 0 } class="material-icons">volume_off</i>
				<i if={ volume > 0 } class="material-icons">volume_down</i>
			</div>
			<div class="bar" ref="volumeInput" onmousedown={ volumeMouseDown }>
				<div class="fill" style="width: { 100 * volume }%"/>
			</div>
		</div>
	</div>

	<div  if="{ currentTrack }" class="art">
		<img if={ albumArt } src="{ albumArt }"/>
	</div>

	<div class="currentTrack" if="{ currentTrack }">
		<div class="trackInfo">
			<div class="primary">{ currentTrack.info.artist } - { currentTrack.info.title }</div>
			<div class="secondary">{ currentTrack.info.album } ({currentTrack.info.year}) #{ currentTrack.info.track_number }</div>
		</div>
		<div class="seekBar" ref="seekInput" onmousedown={ seekMouseDown }>
			<div class="fill" style="width: { 100 * trackProgress }%"/>
			<div class="head" style="left: { 100 * trackProgress }%"/>
		</div>
		<div if="{ currentTrack }" class="trackDuration">{ timeElapsed }</div>
	</div>

	<script>

		this.currentTrack = null;
		this.trackURL = null;
		this.albumArt = null;
		this.volume = 1;
		this.trackProgress = 0;
		this.mouseDown = false;
		this.adjusting = null;
		this.paused = true;

		jumpTo(track) {
			this.currentTrack = track;
			this.albumArt = track.info.artworkURL;
			this.trackURL = track.info.url;
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
			this.refs.htmlAudio.play();
			fetch("api/lastfm/now_playing/" + encodeURIComponent(track.info.path), { credentials: "same-origin", method: "PUT" });
			this.canScrobble = true;
		}

		togglePlay(e) {
			if (this.refs.htmlAudio.paused) {
				this.refs.htmlAudio.play();
			} else {
				this.refs.htmlAudio.pause();
			}
			this.paused = this.refs.htmlAudio.paused;
		}

		skipPrevious(e) {
			eventBus.trigger("player:playPrevious", this.currentTrack);
		}

		skipNext(e) {
			eventBus.trigger("player:playNext", this.currentTrack);
		}

		seekMouseDown(e) {
			this.adjusting = "seek";
		}

		seekMouseMove(e) {
			if (this.mouseDown && this.adjusting == "seek") {
				var x = e.pageX;
				var o = this.refs.seekInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				var progress = Math.min(Math.max(x / this.refs.seekInput.offsetWidth, 0), 1);
				this.refs.htmlAudio.currentTime = progress * this.refs.htmlAudio.duration;
				this.trackProgress = progress;
				this.canScrobble = false;
			}
		}

		volumeMouseDown(e) {
			this.adjusting = "volume";
		}

		volumeMouseMove(e) {
			if (this.mouseDown && this.adjusting == "volume") {
				var x = e.pageX;
				var o = this.refs.volumeInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				var volume = Math.min(Math.max(x / this.refs.volumeInput.offsetWidth, 0), 1);
				this.refs.htmlAudio.volume = volume;
			}
		}

		formatPlaybackTime(secondsPlayed) {
			var minutes = Math.floor(secondsPlayed / 60);
			var seconds = Math.floor(secondsPlayed) - 60 * minutes;
			if (seconds < 10)
			{
				seconds = "0" + seconds;
			}
			return minutes + ":" + seconds;
		}

		updateScrobble() {
			var currentTime = this.refs.htmlAudio.currentTime;
			var duration = this.refs.htmlAudio.duration;
			if (this.canScrobble) {
				var shouldScrobble = duration > 30 && (currentTime > duration/2 || currentTime > 4*60);
				if (shouldScrobble) {
					fetch("api/lastfm/scrobble/" + encodeURIComponent(this.currentTrack.info.path), { credentials: "same-origin", method: "POST" });
					this.canScrobble = false;
				}
			}
		}

		this.on('mount', function() {

			var volume = utils.loadUserData("volume");
			if (volume) {
				this.refs.htmlAudio.volume = volume;
			}

			this.refs.htmlAudio.addEventListener("ended", function() {
				eventBus.trigger("player:trackFinished", this.currentTrack);
			}.bind(this));

			this.refs.htmlAudio.addEventListener("pause", function() {
				this.paused = this.refs.htmlAudio.paused;
				this.update();
			}.bind(this));

			this.refs.htmlAudio.addEventListener("playing", function() {
				this.paused = this.refs.htmlAudio.paused;
				this.update();
			}.bind(this));

			this.refs.htmlAudio.addEventListener("volumechange", function() {
				this.volume = this.refs.htmlAudio.volume;
				utils.saveUserData("volume", this.volume);
				this.update();
			}.bind(this));

			this.refs.htmlAudio.addEventListener("timeupdate", function() {
				var currentTime = this.refs.htmlAudio.currentTime;
				var duration = this.refs.htmlAudio.duration;
				var progress = currentTime / duration;
				this.trackProgress = progress;
				this.timeElapsed = this.formatPlaybackTime(currentTime);
				this.updateScrobble();
				this.update();
			}.bind(this));

			this.refs.htmlAudio.addEventListener('error', function(e) {
				var title = this.currentTrack.info.title || "Unknown Song";
				var errorText = "'" + title + "' could not be played because ";
				var artwork = this.currentTrack.info.artworkURL || null;

				switch (e.target.error.code) {
					case e.target.error.MEDIA_ERR_NETWORK:
						notify.spawn("Playback Error", artwork, errorText + "of a network error.");
						break;
					case e.target.error.MEDIA_ERR_DECODE:
						notify.spawn("Playback Error", artwork, errorText + "of a decoding error.");
						break;
					case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
						notify.spawn("Playback Error", artwork, errorText + "it is not a suitable source of audio.");
						break;
					default:
						console.log("Unexpected playback error: " + e.target.error.code);
						break;
				}

				eventBus.trigger("player:trackFinished", this.currentTrack);
			}.bind(this));
		});

		// Global mouse handling
		var onMouseMove = function(e) {
			if (!this.mouseDown) {
				return;
			}
			if (this.adjusting == "volume") {
				this.volumeMouseMove(e);
			} else if (this.adjusting == "seek") {
				this.seekMouseMove(e);
			}
		}.bind(this);

		document.body.addEventListener('mousemove', onMouseMove );
		document.body.addEventListener('mousedown', function(e){
    		this.mouseDown = true;
			onMouseMove(e);
		}.bind(this));

		document.body.addEventListener('mouseup', function(){
    		this.mouseDown = false;
			this.adjusting = null;
		}.bind(this));

		eventBus.on("playlist:queued", this.onTrackQueued);
		eventBus.on("playlist:jumpTo", this.jumpTo);
		eventBus.on("playlist:play", this.play);
	</script>

	<style>
		player {
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
			border: 1px solid #AAA;
			text-align: center;
		}

		.control.previous, .control.next {
			width: 28px;
			height: 28px;
			line-height: 28px;
			padding-top: 4px;
			box-sizing: border-box;
		}

		.control.play, .control.pause {
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
			background-color: #AAA;
			height: 10px;
			margin: 7px 0;
			border-radius: 3px;
		}

		.volume .fill {
			height: 100%;
			max-width: 100%;
			background-color: #44C8F1;
			border-radius: 3px;
		}

		.trackInfo .primary {
			font-weight: 600;
			margin-bottom: -5px;
		}

		.trackInfo .secondary, .trackDuration {
			font-weight: 300;
			font-size: 0.875rem;
		}

		.seekBar {
			width: 100%;
			background-color: #AAA;
			height: 10px;
			margin: 6px 0;
			border-radius: 3px;
		}

		.seekBar .fill {
			height: 100%;
			width: 0;
			max-width: 100%;
			background-color: #44C8F1;
			border-radius: 3px;
		}

		.seekBar .head {
			width: 16px;
			height: 16px;
			position: relative;
			top: -14px;
			margin-left: -9px;
			background-color: #FFF;
			border: 1px solid #AAA;
			border-radius: 3px;
		}

		.controls, .art img, .currentTrack {
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
</player>