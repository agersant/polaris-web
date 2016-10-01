<player>

	<h2>Player</h2>
	<span if="{ currentTrack }">{ currentTrack.info.artist } - { currentTrack.info.track_number }. { currentTrack.info.title }</span>
	<audio name="htmlAudio" controls src="{ trackURL }"></audio>

	<script>

		this.currentTrack = null;
		this.trackURL = null;

		play(track) {
			this.currentTrack = track;
			this.trackURL = "api/serve/" + track.info.path;
			this.update();
			this.htmlAudio.play();
		}

		this.htmlAudio.addEventListener( "ended", function(){
			eventBus.trigger("player:trackFinished", this.currentTrack);
		}.bind(this));

		eventBus.on("playlist:jumpTo", this.play);

	</script>

	<style>
		player {
			display: block;
			clear: both;
			width: 100%;
			height: 200px;
			background-color: pink;
		}

		player audio {
			width: 100%;
		}
	</style>
</player>