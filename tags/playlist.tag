<playlist>

	<h2>Playlist</h2>

	<span onclick={ clear }>Clear</span>
	
	<ul>
		<li each={ tracks }>
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

		clear() {
			this.tracks = [];
		}

		eventBus.on("playlist:queue", this.queue);
	</script>
</playlist>