<playlist>

	<div class="paneHeader">
		<h2>{ this.playlistName || "Playlist" }</h2>
		<div class="playlistOperations">
			<span class="noselect save" onclick={ onClickSave }>
				<i class="material-icons md-18">save</i>
				<playlist-save if={ saving } tracks={ tracks } name={ playlistName } />
			</span>
			<span data-cy="clear-playlist" class="noselect delete" onclick={ onClickClear }>
				<i class="material-icons md-18">delete</i>
			</span>
			<span class="playbackOrder">
				Order:
				<select ref="playbackOrder" onchange={ onChangePlaybackOrder }>
					<option value="default">Default</option>
					<option value="random">Random</option>
					<option value="repeat-track">Repeat Track</option>
					<option value="repeat-all">Repeat All</option>
				</select>
			</span>
		</div>
	</div>

	<div data-cy="playlist" class="paneContent" ref="scrollElement" ondragover={ allowDrop } ondrop={ onDrop }>
		<div style="height: { scrollOffset * itemHeight }px"></div>
		<table>
			<tbody>
				<tr data-cy="track" class={ track:true, nowPlaying: (track == currentTrack) } each={ track in tracks.slice( scrollOffset, scrollOffset + pageSize ) } no-reorder onclick={ onClickTrack }>
					<td data-cy="remove" class="remove"><div class="remove noselect" onclick={ onClickRemoveTrack }>[-]</div></td>
					<td class="nowPlaying"><i data-cy="now-playing" if={ track == currentTrack } class="nowPlaying material-icons md-16">play_arrow</i></td>
					<td class="text">{ formatTrackContext(track) }</td>
					<td class="text song">
						{ formatTrackDetails(track) }
						<span class="trackArtist" if={ track.info.album_artist && track.info.artist && track.info.album_artist != track.info.artist }>
							({ track.info.artist })
						</span>
					</td>
					<td class="text duration">{ formatTrackDuration(track) }</td>
				</tr>
			</tbody>
		</table>
		<div style="height: { (tracks.length - scrollOffset - pageSize) * itemHeight }px"></div>
		<div class="help" if={ tracks.length == 0 }>
			<i class="material-icons md-48">queue</i><br/>
			Make a playlist by dragging music from your collection to here.
		</div>
	</div>

	<script>

		this.pageSize = 50;
		this.pagePadding = 6;
		this.itemHeight = 30; // Also defined in CSS

		this.on('mount', function() {
			this.loadFromDisk();
			this.refs.scrollElement.onscroll = function() {
				var newOffset = Math.max(0, Math.floor(this.refs.scrollElement.scrollTop / this.itemHeight) - this.pagePadding );
				newOffset = 2 * Math.floor(newOffset / 2); // Preserve odd/even row indices
				if (newOffset == this.scrollOffset) {
					return;
				}
				this.scrollOffset = newOffset;
				this.update();
			}.bind(this);
		});

		loadFromDisk() {
			var playbackOrder = utils.loadUserData("playbackOrder");
			if (playbackOrder) {
				this.refs.playbackOrder.value = playbackOrder;
			}
			var tracks = utils.loadUserData("playlist");
			if (tracks) {
				this.tracks = tracks;
			}
			var currentTrackIndex = utils.loadUserData("currentTrackIndex");
			if (currentTrackIndex && currentTrackIndex >= 0 && currentTrackIndex < this.tracks.length) {
				var newTrack = this.tracks[currentTrackIndex];
				eventBus.trigger("playlist:jumpTo", newTrack);
			}
			this.playlistName = utils.loadUserData("playlistName");
		}

		clear() {
			this.scrollOffset = 0;
			this.playlistName = null;
			this.tracks = [];
			this.update();
		}

		queueTrackInternal(track) {
			var playlistTrack = {};
			playlistTrack.info = track;
			this.tracks.push(playlistTrack);
			eventBus.trigger("playlist:queued", playlistTrack);
		}

		queueTrack(track) {
			this.queueTrackInternal(track);
			this.saveLocalPlaylist();
			this.update();
		}

		queueTracks(tracks) {
			for (var i = 0; i < tracks.length; i++) {
				this.queueTrackInternal(tracks[i]);
			}
			this.saveLocalPlaylist();
			this.update();
		}

		queueURL(url) {
			utils.api(url)
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				var length = data.length;
				for (var i = 0; i < length; i++) {
					data[i].url = "api/serve/" + encodeURIComponent(data[i].path);
					if (data[i].album && data[i].artwork) {
						data[i].artworkURL = "api/serve/" + encodeURIComponent(data[i].artwork);
					}
				}
				this.queueTracks(data);
			}.bind(this))
		}

		queueDirectory(path) {
			this.queueURL('/flatten/' + encodeURIComponent(path));
		}

		queuePlaylist(name, tracks) {
			this.clear();
			this.playlistName = name;
			if (tracks) {
				this.queueTracks(tracks);
			} else {
				this.queueURL('/playlist/' + encodeURIComponent(name));
			}
		}

		advance(currentTrack, delta) {
			var playbackOrder = this.refs.playbackOrder.selectedOptions[0].value;
			var numTracks = this.tracks.length;

			var newTrack = null;
			if (numTracks > 0) {
				if (playbackOrder == "random") {
					var newTrackIndex = Math.floor(Math.random() * numTracks);
					newTrack = this.tracks[newTrackIndex];
				} else if (playbackOrder == "repeat-track") {
					newTrack = currentTrack;
				} else {
					var currentTrackIndex = this.tracks.indexOf(currentTrack);
					if (currentTrackIndex < 0) {
						newTrack = this.tracks[0];
					} else {
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
					}
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
			eventBus.trigger("playlist:play", playlistTrack);
		}

		snapToCurrentTrack() {
			var currentTrackIndex = this.tracks.indexOf(this.currentTrack);
			if (currentTrackIndex < 0) {
				return;
			}
			this.refs.scrollElement.scrollTop = (currentTrackIndex - 10) * this.itemHeight;
		}

		onClickTrack(e) {
			this.playTrack(e.item.track);
		}

		onDrop(e) {
			e.preventDefault();
			var item = e.dataTransfer.getData("text/json");
			item = JSON.parse(item);
			var variant = item.variant;
			if (variant == "Song") {
				this.queueTrack(item.fields);
				this.update();
			} else if (variant == "Directory") {
				this.queueDirectory(item.fields.path);
			} else if (variant == "Playlist") {
				this.queuePlaylist(item.fields.name);
			}
		}

		updateCurrentTrack(track) {
			this.currentTrack = track;
			this.saveLocalPlaylist();
			this.update();
		}

		onClickRemoveTrack(e) {
			e.stopPropagation();
			var trackIndex = this.tracks.indexOf(e.item.track);
			if (trackIndex >= 0) {
				this.tracks.splice(trackIndex, 1);
			}
			this.saveLocalPlaylist();
		}

		onClickClear() {
			this.clear();
			this.saveLocalPlaylist();
		}

		allowDrop(e) {
			e.preventDefault();
			return false;
		};

		onChangePlaybackOrder(e) {
			var playbackOrder = this.refs.playbackOrder.selectedOptions[0].value;
			utils.saveUserData("playbackOrder", playbackOrder);
		}

		saveLocalPlaylist() {
			if (utils.saveUserData("playlist", this.tracks)) {
				utils.saveUserData("playlistName", this.playlistName);
				var currentTrackIndex = this.tracks.indexOf(this.currentTrack);
				utils.saveUserData("currentTrackIndex", currentTrackIndex);
			}
		}

		onClickSave() {
			this.saving = true;
		}

		endSave(playlistName) {
			this.saving = false;
			this.playlistName = playlistName;
			this.saveLocalPlaylist();
			this.update();
		}

		formatTrackContext(track) {
			context = "";
			if (track.info.album_artist || track.info.artist) {
				context += track.info.album_artist || track.info.artist;
			} else {
				context += "Unknown Artist";
			}
			context += " - ";
			context += track.info.album ? track.info.album : "Unknown Album";
			if (track.info.year) {
				context += " (" + track.info.year + ")";
			}
			return context;
		}

		formatTrackDetails(track) {
			details = "";
			if (track.info.track_number)  {
				details += track.info.track_number;
				details += ". ";
			}
			if (track.info.title) {
				details += track.info.title;
			} else {
				details += utils.stripFileExtension(utils.getPathTail(track.info.path));
			}
			return details;
		}

		formatTrackDuration(track) {
			var durationInSeconds = parseInt(track.info.duration, 10);
			if (isNaN(durationInSeconds)) {
				return "";
			}
			var date = new Date(null);
			date.setSeconds(durationInSeconds);
			var formatted = date.toISOString().substr(11, 8);
			formatted = formatted.replace(/^[0:]{1,4}/, "");
			return formatted;
		}

		eventBus.on("browser:queueTrack", this.queueTrack);
		eventBus.on("browser:queueTracks", this.queueTracks);
		eventBus.on("browser:queueDirectory", this.queueDirectory);
		eventBus.on("browser:queuePlaylist", this.queuePlaylist);
		eventBus.on("player:trackFinished", this.playNext);
		eventBus.on("player:playPrevious", this.playPrevious);
		eventBus.on("player:playNext", this.playNext);
		eventBus.on("player:playing", this.updateCurrentTrack);
		eventBus.on("playlist-save:cancel", this.endSave);
		eventBus.on("playlist-save:done", this.endSave);

		this.clear();

	</script>

	<style>

		.paneHeader {
			overflow: visible !important;
		}

		.paneContent {
			padding-left: 0 !important;
			padding-right: 0 !important;
			overflow-anchor: none;
		}

		.playlistOperations {
			display: flex;
			flex-grow: 1;
			flex-shrink: 1;
			min-height: 0;
		}

		.playlistOperations .save, .playlistOperations .delete {
			cursor: pointer;
			padding-right: 8px;
		}

		.playlistOperations span.playbackOrder {
			color: var(--theme-foreground-muted);
			font-size: 0.875rem;
			align-self: center;
		}

		.track {
			cursor: default;
			white-space: nowrap;
		}

		.track:not(:hover) .remove {
			color: transparent;
		}

		.remove {
			cursor: pointer;
		}

		table {
			width: 100%;
			border-spacing: 0;
		}

		tr {
			height: 30px; /*Used in JS*/
		}

		tr:nth-child(2n) {
			background-color: var(--theme-background-muted);
		}

		td {
			padding-bottom: 3px;
			vertical-align: bottom;
			font-size: 0.8125rem;
		}

		.remove, playlist .nowPlaying {
			width: 25px;
		}

		.remove, playlist td.nowPlaying {
			text-align: center;
		}

		td.text {
			max-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding-right: 30px;
		}

		td.song .trackArtist {
			color: var(--theme-foreground-muted);
		}

		td.duration {
			text-align: right;
		}

		tr.nowPlaying td.song .trackArtist {
			color: var(--theme-foreground-against-accent);
			opacity: 0.65;
		}

		tr.nowPlaying td, tr.nowPlaying td * {
			color: var(--theme-foreground-against-accent);
			font-weight: 600;
			background-color: var(--theme-accent);
		}

		.material-icons.nowPlaying {
			vertical-align: middle;
			padding-bottom: 2px;
		}
	</style>

</playlist>
