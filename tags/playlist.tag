<playlist>

	<h2>Playlist</h2>

	<span onclick={ clear }>Clear</span>

	<select name="playbackOrder">
		<option value="default">Default</option>
		<option value="random">Random</option>
		<option value="repeat-track">Repeat Track</option>
		<option value="repeat-all">Repeat All</option>
	</select>

	<ul ondragover={ allowDrop } ondrop={ onDrop }>
		<li class="track" each={ tracks } onclick={ onClickTrack }>
			<span class="remove" onclick={ onClickRemoveTrack }>[-]</span>{ info.artist } - { info.track_number }. { info.title }
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
			fetch('api/flatten/' + path, { credentials: "same-origin" })
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				var length = data.length;
				for (var i = 0; i < length; i++) {
					this.queueTrackInternal(data[i]);
				}
				this.update();
			}.bind(this));
		}

		playNext(currentTrack) {
			var playbackOrder = this.playbackOrder.selectedOptions[0].value;
			var numTracks = this.tracks.length;

			var nextTrack = null;
			if (playbackOrder == "random") {
				if (numTracks > 0) {
					var nextTrackIndex = Math.floor(Math.random() * numTracks);
					nextTrack = this.tracks[nextTrackIndex];
				}
			} else if (playbackOrder == "repeat-track") {
				nextTrack = currentTrack;
			} else {
				var currentTrackIndex = this.tracks.indexOf(currentTrack);
				if (currentTrackIndex >= 0) {
					if (currentTrackIndex + 1 < numTracks) {
						nextTrack = this.tracks[currentTrackIndex + 1];
					} else if ( playbackOrder == "repeat-all" ) {
						nextTrack = this.tracks[0];
					}
				} else if (numTracks > 0) {
					nextTrack = this.tracks[0];
				}
			}

			if (nextTrack != null) {
				this.playTrack(nextTrack);
			}
		}

		playTrack(playlistTrack) {
			eventBus.trigger("playlist:jumpTo", playlistTrack);
		}

		onClickTrack(e) {
			this.playTrack(e.item);
		}

		onClickRemoveTrack(e) {
			e.stopPropagation();
			var trackIndex = this.tracks.indexOf(e.item);
			if (trackIndex >= 0) {
				this.tracks.splice(trackIndex, 1);
			}
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

	<style>
		playlist .track {
			cursor: default;
		}
		playlist .track:hover .remove {
			visibility: visible;
		}
		playlist .track:not(:hover) .remove {
			visibility: hidden;
		}
		playlist .remove {
			cursor: pointer;
		}
	</style>

</playlist>