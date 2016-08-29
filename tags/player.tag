<player>

	<h2>Player</h2>
	<span>{ currentTrack.info.display_name }</span>
	<audio name="htmlAudio" controls src="api/serve/{ currentTrack.info.path }"></audio>

	<script>

		this.currentTrack = null;

		play(track) {
			this.currentTrack = track;
			this.update();
			this.htmlAudio.play();
		}

		this.htmlAudio.addEventListener( "ended", function(){
			eventBus.trigger("player:trackFinished", this.currentTrack);
		}.bind(this));

		eventBus.on("playlist:jumpTo", this.play);

	</script>
</player>