<playlist>

	<div class="paneHeader">
		<h2>Playlist</h2>

		<span onclick={ clear }>Clear</span>

		<span class="playbackOrder">
			Order:
			<select name="playbackOrder">
				<option value="default">Default</option>
				<option value="random">Random</option>
				<option value="repeat-track">Repeat Track</option>
				<option value="repeat-all">Repeat All</option>
			</select>
		</span>
	</div>

	<div class="paneContent" ondragover={ allowDrop } ondrop={ onDrop }>
		<table>
			<thead>
				<th class="remove"></th>
				<th class="nowPlaying"></th>
				<th>Artist - Album</th>
				<th class="song">Song</th>
			</thead>
			<tbody>
				<tr class={ track:true, nowPlaying: (track == currentTrack) } each={ track in tracks } onclick={ onClickTrack }>
					<td><div class="remove" onclick={ onClickRemoveTrack }>[-]</div></td>
					<td class="nowPlaying"><i if={ track == currentTrack } class="nowPlaying material-icons md-16">play_arrow</i></td>
					<td class="text">{ track.info.artist } - { track.info.album } ({ track.info.year })</td>
					<td class="text song">{ track.info.track_number }. { track.info.title }</td>
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
					if (data[i].album && data[i].artwork) {
						data[i].artwork = "api/serve/" + data[i].artwork;
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
			this.playTrack(e.item.track);
		}

		updateCurrentTrack(track) {
			this.currentTrack = track;
			this.update();
		}

		onClickRemoveTrack(e) {
			e.stopPropagation();
			var trackIndex = this.tracks.indexOf(e.item.track);
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
		eventBus.on("player:playing", this.updateCurrentTrack);

		this.clear();

	</script>

	<style>
		playlist .playbackOrder {
			position: absolute;
			right: 20px;
		}

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

		playlist .remove, playlist td.nowPlaying {
			width: 30px;
			text-align: center;
		}

		playlist td.text {
			max-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding-right: 30px;
		}

		playlist td.song {
			width: 65%;
		}

		playlist tr.nowPlaying td {
			color: #FFF;
			font-weight: 600;
			background-color: #13D5FF;
		}

		playlist .material-icons.nowPlaying {
			vertical-align: middle;
			padding-bottom: 2px;
		}
	</style>

</playlist>