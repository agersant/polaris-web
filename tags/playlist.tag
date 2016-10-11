<playlist>

	<div class="paneHeader">
		<h2>Playlist</h2>
		<span onclick={ clear }>Clear</span>
		<select name="playbackOrder">
			<option value="default">Default</option>
			<option value="random">Random</option>
			<option value="repeat-track">Repeat Track</option>
			<option value="repeat-all">Repeat All</option>
		</select>
	</div>

	<div class="paneContent" ondragover={ allowDrop } ondrop={ onDrop }>
		<table>
			<thead>
				<th></th>
				<th>Artist - Album</th>
				<th>Song</th>
			</thead>
			<tbody>
				<tr class="track" each={ tracks } onclick={ onClickTrack }>
					<td><span class="remove" onclick={ onClickRemoveTrack }>[-]</span></td>
					<td>{ info.album.artist } - { info.album.title } ({ info.album.year })</td>
					<td>{ info.track_number }. { info.title }</td>
				</tr>
			</tbody>
		</table>
	</div>

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
					data[i].path = "api/serve/" + data[i].path;
					if (data[i].album && data[i].album.album_art) {
						data[i].album.album_art = "api/serve/" + data[i].album.album_art;
					}
					this.queueTrackInternal(data[i]);
				}
				this.update();
			}.bind(this));
		}

		advance(currentTrack, delta) {
			var playbackOrder = this.playbackOrder.selectedOptions[0].value;
			var numTracks = this.tracks.length;

			var newTrack = null;
			if (playbackOrder == "random") {
				if (numTracks > 0) {
					var newTrackIndex = Math.floor(Math.random() * numTracks);
					newTrack = this.tracks[newTrackIndex];
				}
			} else if (playbackOrder == "repeat-track" || delta == 0) {
				newTrack = currentTrack;
			} else {
				var currentTrackIndex = this.tracks.indexOf(currentTrack);
				if (currentTrackIndex >= 0) {
					var newTrackIndex = currentTrackIndex + delta;
					if (newTrackIndex >= 0 && newTrackIndex < numTracks) {
						newTrack = this.tracks[newTrackIndex];
					} else if (playbackOrder == "repeat-all") {
						if (delta > 0) {
							newTrack = this.tracks[0];
						} else {
							newTrack = this.tracks[this.tracks.length - 1];
						}
					}
				} else if (numTracks > 0) {
					newTrack = this.tracks[0];
				}
			}

			if (newTrack != null) {
				this.playTrack(newTrack);
			}
		}

		playPrevious(currentTrack) {
			return this.advance(currentTrack, -1);
		}

		playNext(currentTrack) {
			return this.advance(currentTrack, 1);
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
		eventBus.on("player:playPrevious", this.playPrevious);
		eventBus.on("player:playNext", this.playNext);

		this.clear();

	</script>

	<style>
		playlist .track {
			cursor: default;
			white-space: nowrap;
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

		playlist table {
			width: 100%;
			border-spacing: 0;
		}

		playlist th {
			border-bottom: 1px solid #EEE;
			text-align: left;
			margin-bottom: 20px;
		}

		playlist tr:nth-child(2n) {
			background-color: #F5F5F5;
		}

		playlist td {
			padding: 2px 0;
		}
	</style>

</playlist>