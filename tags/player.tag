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
			<div class="bar" onclick={ setVolume }>
				<div class="fill" name="volumeFill" style="width: { volume }%"/>
			</div>
		</div>
	</div>

	<div  if="{ currentTrack }" class="art">
		<img if={ albumArt } src="{ albumArt }"/>
	</div>

	<div class="currentTrack" if="{ currentTrack }">
		<div class="trackInfo">
			<div class="primary">{ currentTrack.info.artist } - { currentTrack.info.title }</div>
			<div class="secondary">{ currentTrack.info.album.title } ({currentTrack.info.album.year}) #{ currentTrack.info.track_number }</div>
		</div>
		<div class="seekBar" onclick={ seek }>
			<div class="fill" style="width: { trackProgress }%"/>
			<div class="head" style="left: { trackProgress }%"/>
		</div>
		<div if="{ currentTrack }" class="trackDuration">x:xx</div>
	</div>

	<script>

		this.currentTrack = null;
		this.trackURL = null;
		this.albumArt = null;
		this.volume = 100;
		this.trackProgress = 0;

		play(track) {
			this.currentTrack = track;
			this.albumArt = track.info.album.album_art;
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

		seek(e) {
			var x = e.pageX;
			var o = e.currentTarget;
			while (o) {
				x -= o.offsetLeft;
				o = o.offsetParent;
			}
			var progress = Math.min(Math.max(x / e.currentTarget.offsetWidth, 0), 1);
			this.htmlAudio.currentTime = progress * this.htmlAudio.duration;
			this.trackProgress = 100 * progress;
		}

		setVolume(e) {
			var x = e.pageX;
			var o = e.currentTarget;
			while (o) {
				x -= o.offsetLeft;
				o = o.offsetParent;
			}
			var volume = Math.min(Math.max(x / e.currentTarget.offsetWidth, 0), 1);
			this.htmlAudio.volume = volume;
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
			this.volume = (100 * this.htmlAudio.volume);
			this.update();
		}.bind(this));

		this.htmlAudio.addEventListener("timeupdate", function() {
			var progress = this.htmlAudio.currentTime / this.htmlAudio.duration;
			this.trackProgress = 100 * progress;
			this.update();
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
			margin: 6px 0;
			border-radius: 5px;
		}

		player .volume .fill {
			height: 100%;
			max-width: 100%;
			background-color: #13D5FF;
			border-radius: 5px;
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
			border-radius: 5px;
		}

		player .seekBar .fill {
			height: 100%;
			width: 0;
			max-width: 100%;
			background-color: #13D5FF;
			border-radius: 5px;
		}

		player .seekBar .head {
			width: 16px;
			height: 16px;
			position: relative;
			top: -14px;
			margin-left: -8px;
			background-color: #FFF;
			border: 1px solid #BBB;
			border-radius: 50%;
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