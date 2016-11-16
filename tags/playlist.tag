<playlist>

	<div class="paneHeader">
		<h2>Playlist</h2>

		<span class="clear noselect" onclick={ clear }>Clear</span>

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

	<div class="paneContent" name="scrollElement" ondragover={ allowDrop } ondrop={ onDrop }>
		<div style="height: { scrollOffset * itemHeight }px"></div>
		<table>
			<thead>
				<th class="remove"></th>
				<th class="nowPlaying"></th>
				<th>Artist - Album</th>
				<th class="song">Song</th>
			</thead>
			<tbody>
				<tr class={ track:true, nowPlaying: (track == currentTrack) } each={ track in tracks.slice( scrollOffset, scrollOffset + pageSize ) } no-reorder onclick={ onClickTrack }>
					<td><div class="remove noselect" onclick={ onClickRemoveTrack }>[-]</div></td>
					<td class="nowPlaying"><i if={ track == currentTrack } class="nowPlaying material-icons md-16">play_arrow</i></td>
					<td class="text">{ track.info.artist } - { track.info.album } ({ track.info.year })</td>
					<td class="text song">{ track.info.track_number }. { track.info.title }</td>
				</tr>
			</tbody>
		</table>
		<div style="height: { (tracks.length - scrollOffset - pageSize) * itemHeight }px"></div>
	</div>

	<script>

		this.pageSize = 60;
		this.itemHeight = 30; // Also defined in CSS

		var wait = false;
		var hasPendingUpdate = false;
		var hasCallback = false;
		this.scrollElement.onscroll = function() {
			var newOffset = Math.max(0, Math.floor(this.scrollElement.scrollTop / this.itemHeight - 1));
			newOffset = 2 * Math.floor(newOffset / 2); // Preserve odd/even row indices
			if (newOffset == this.scrollOffset) {
				return;
			}
			this.scrollOffset = newOffset;

			if (!wait) {
				wait = true;
				setTimeout(function(){
					wait = false;
				}.bind(this), 1);
				this.update();
			} else if (!hasCallback) {
				hasPendingUpdate = true;
				setTimeout(function(){
					hasPendingUpdate = false;
					this.update();
				}.bind(this), 1);
			}
		}.bind(this);

		clear() {
			this.scrollOffset = 0;
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
			this.snapToCurrentTrack();
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

		snapToCurrentTrack() {
			var currentTrackIndex = this.tracks.indexOf(this.currentTrack);
			if (currentTrackIndex < 0) {
				return;
			}
			this.scrollElement.scrollTop = (currentTrackIndex - 10) * this.itemHeight;
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
		playlist .clear {
			cursor: pointer;
		}

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
			font-size: 16px;
			padding-top: 6px;
		}

		playlist th, tr {
			height: 30px; /*Used in JS*/
		}

		playlist tr:nth-child(2n) {
			background-color: #F5F5F5;
		}

		playlist td {
			padding-top: 4px;
			font-size: 14px;
		}

		playlist .remove, playlist .nowPlaying {
			width: 30px;
		}

		playlist .remove, playlisy td.nowPlaying {
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

		playlist tr.nowPlaying td, playlist tr.nowPlaying td * {
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