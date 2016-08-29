<playlist>

	<h2>Playlist</h2>

	<span onclick={ clear }>Clear</span>

	<ul ondragover={ allowDrop } ondrop={ onDrop }>
		<li each={ tracks } onclick={ onClickItem }>
			{ info.display_name }
		</li>
	</ul>

	<script>

		clear() {
			this.tracks = [];
			this.update();
		}

		queueTrackInternal(track) {
			var playlistTrack = {};
			playlistTrack.info = track;
			this.tracks.push(playlistTrack);
		}

		queueTrack(track) {
			this.queueTrackInternal(track);
			this.update();
		}

		queueDirectory(path) {
			fetch('api/flatten/' + path)
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				var length = data.length;
				for (var i = 0; i < length; i++) {
					console.log(data[i]);
					this.queueTrackInternal(data[i]);
				}
				this.update();
			}.bind(this));
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

		playTrack(playlistTrack) {
			eventBus.trigger("playlist:jumpTo", playlistTrack);
		}

		onClickItem(e) {
			this.playTrack(e.item);
		}

		allowDrop(e) {
			return false;
		};

		onDrop(e) {
			var item = e.dataTransfer.getData("text/json");
			item = JSON.parse(item);
			var variant = item.variant;
			if ( variant == "Song" ) {
				this.queueTrack(item.fields);
				this.update();
			} else if ( variant == "Directory" ) {
				this.queueDirectory(item.fields.path);
			}
		}

		eventBus.on("browser:queueTrack", this.queueTrack);
		eventBus.on("player:trackFinished", this.playNext);

		this.clear();

	</script>
</playlist>