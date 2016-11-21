<player>

	<audio name="htmlAudio" controls src="{ trackURL }"/>

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
			<div class="bar" name="volumeInput" onmousedown={ volumeMouseDown }>
				<div class="fill" name="volumeFill" style="width: { 100 * volume }%"/>
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
		<div class="seekBar" name="seekInput" onmousedown={ seekMouseDown }>
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

		play(track) {
			this.currentTrack = track;
			this.albumArt = track.info.artwork;
			this.trackURL = track.info.path;
			this.update();
			this.htmlAudio.play();
			eventBus.trigger("player:playing", this.currentTrack);
		}

		togglePlay(e) {
			if (this.htmlAudio.paused) {
				this.htmlAudio.play();
			} else {
				this.htmlAudio.pause();
			}
			this.paused = this.htmlAudio.paused;
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
				var o = this.seekInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				var progress = Math.min(Math.max(x / this.seekInput.offsetWidth, 0), 1);
				this.htmlAudio.currentTime = progress * this.htmlAudio.duration;
				this.trackProgress = progress;
			}
		}

		volumeMouseDown(e) {
			this.adjusting = "volume";
		}

		volumeMouseMove(e) {
			if (this.mouseDown && this.adjusting == "volume") {
				var x = e.pageX;
				var o = this.volumeInput;
				while (o) {
					x -= o.offsetLeft;
					o = o.offsetParent;
				}
				var volume = Math.min(Math.max(x / this.volumeInput.offsetWidth, 0), 1);
				this.htmlAudio.volume = volume;
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

		this.htmlAudio.addEventListener("ended", function() {
			eventBus.trigger("player:trackFinished", this.currentTrack);
		}.bind(this));

		this.htmlAudio.addEventListener("pause", function() {
			this.paused = this.htmlAudio.paused;
			this.update();
		}.bind(this));

		this.htmlAudio.addEventListener("playing", function() {
			this.paused = this.htmlAudio.paused;
			this.update();
		}.bind(this));

		this.htmlAudio.addEventListener("volumechange", function() {
			this.volume = this.htmlAudio.volume;
			this.update();
		}.bind(this));

		this.htmlAudio.addEventListener("timeupdate", function() {
			var progress = this.htmlAudio.currentTime / this.htmlAudio.duration;
			this.trackProgress = progress;
			this.timeElapsed = this.formatPlaybackTime(this.htmlAudio.currentTime);
			this.update();
		}.bind(this));

		this.htmlAudio.addEventListener('error', function(e) {
			var title = this.currentTrack.info.title || "Unknown Song";
			var errorText = "'" + title + "' could not be played because ";
			var artwork = this.currentTrack.info.artwork || null;

			var format = utils.getFileExtension(this.currentTrack.info.path);
			if (format) {
				format = " (" + format + ")";
			} else {
				format = "";
			}

			switch (e.target.error.code) {
				case e.target.error.MEDIA_ERR_NETWORK:
					notify.spawn("Playback Error", artwork, errorText + "of a network error.");
					break;
				case e.target.error.MEDIA_ERR_DECODE:
					notify.spawn("Playback Error", artwork, errorText + "of a decoding error.");
					break;
				case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
					notify.spawn("Playback Error", artwork, errorText + "your browser does not support this file format" + format + ".");
					break;
				default:
					console.log("Unexpected playback error: " + e.target.error.code);
					break;
			}

			eventBus.trigger("player:trackFinished", this.currentTrack);
		}.bind(this));

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

		eventBus.on("playlist:jumpTo", this.play);
	</script>

	<style>
		player {
			border-top: 1px solid #EEE;
			padding: 40px;
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			justify-content: center;
		}

		player audio {
			display: none;
		}

		player .art {
			width: 120px;
			height: 120px;
			border-radius: 5px;
		}

		player .art img {
			width: 100%;
			height: 100%;
			border-radius: 5px;
		}

		player .currentTrack {
			flex-grow: 1;
			min-width: 200px;
			padding-left: 20px;
		}

		player .controls {
			margin-right: 20px;
			width: 120px;
			cursor: default;
		}

		player .controls .playback {
			display: flex;
			flex-flow: row nowrap;
			justify-content: space-between;
			align-items: center;
			font-size: 16px;
		}

		player .control {
			border-radius: 50%;
			border: 1px solid #BBB;
			text-align: center;
		}

		player .control.previous, player .control.next {
			width: 28px;
			height: 28px;
			line-height: 28px;
			padding-top: 4px;
			box-sizing: border-box;
		}

		player .control.play, player .control.pause {
			padding-top: 6px;
			width: 40px;
			height: 40px;
			line-height: 40px;
			box-sizing: border-box;
		}

		player .volume {
			margin-left: -4px;
			display: flex;
			flex-flow: row nowrap;
		}

		player .volume .bar {
			flex-grow: 1;
			background-color: #BBB;
			height: 10px;
			margin: 7px 0;
			border-radius: 3px;
		}

		player .volume .fill {
			height: 100%;
			max-width: 100%;
			background-color: #13D5FF;
			border-radius: 3px;
		}

		player .trackInfo .primary {
			font-weight: 600;
			font-size: 16px; 
			margin-bottom: -5px;
		}

		player .trackInfo .secondary, player .trackDuration {
			font-weight: 300;
			font-size: 14px; 
		}

		player .seekBar {
			width: 100%;
			background-color: #BBB;
			height: 10px;
			margin: 6px 0;
			border-radius: 3px;
		}

		player .seekBar .fill {
			height: 100%;
			width: 0;
			max-width: 100%;
			background-color: #13D5FF;
			border-radius: 3px;
		}

		player .seekBar .head {
			width: 16px;
			height: 16px;
			position: relative;
			top: -14px;
			margin-left: -9px;
			background-color: #FFF;
			border: 1px solid #BBB;
			border-radius: 3px;
		}

		player .controls, player .art img, player .currentTrack {
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