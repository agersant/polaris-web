<playlist>

	<h2>Playlist</h2>

	<span onclick={ clear }>Clear</span>

	<ul>
		<li each={ tracks } onclick={ onClickItem }>
			{ info.display_name }
		</li>
	</ul>

	<script>
		this.tracks = [];

		queue(track) {
			var playlistTrack = {};
			playlistTrack.info = track.fields;
			this.tracks.push(playlistTrack);
			this.update();
		}

		playNext(currentTrack) {
			var length = this.tracks.length;
			for (var i = 0; i < length; i++) {
				if (this.tracks[i] == currentTrack)
				{
					if (i + 1 < length) {
						var nextTrack = this.tracks[i+1];
						this.playTrack(nextTrack);
					}
					break;
				}
			}			
		}

		clear() {
			this.tracks = [];
		}

		playTrack(playlistTrack) {
			eventBus.trigger("playlist:jumpTo", playlistTrack);
		}

		onClickItem(e) {
			this.playTrack(e.item);
		}

		eventBus.on("browser:queue", this.queue);
		eventBus.on("player:trackFinished", this.playNext);

	</script>
</playlist>