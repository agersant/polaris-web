<browser>

	<div class="paneHeader">
		<h2>Music Collection</h2>
		<breadcrumbs></breadcrumbs>
	</div>

	<div class="paneContent">

		<ul if={ viewMode == "explorer" } class="explorerView">
			<li draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<div if={ variant == "Directory" } class="directory">{ fields.name }</div>
				<div if={ variant == "Song" } class="song">{ fields.artist } - { fields.track_number }. { fields.title }</div>
			</li>
		</ul>

		<ul if={ viewMode == "discography" } class="discographyView">
			<li class="album" draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<div class="cover">
					<div class="coverCanvas">
						<img if={ fields.artwork } src="{ fields.artwork }"/>
					</div>
				</div>
				<div class="details">
					<div class="title">{ fields.album }</div>
					<div class="year">{ fields.year }</div>
				</div>
			</li>
		</ul>

		<div if={ viewMode == "album" } class="albumView">
			<div class="title">{ album }</div>
			<div class="artist">{ artist }</div>
			<div class="details">
				<img src="{ artwork }" draggable="true" ondragstart={ onDragAlbumStart } />
				<div class="trackList">
					<ul>
						<li each={ browseResults } >
							<div class="discNumber" if="{ browseResults.length > 1 }">Disc { discNumber }</div>
							<ol class="discContent">
								<li value={ fields.track_number } class="song" draggable="true" each={ songs } onclick={ onClickItem } ondragstart={ onDragItemStart }>
									{ fields.title }
									<span class="trackArtist" if={ fields.artist && fields.album_artist && fields.artist != fields.album_artist }>
										({ fields.artist })
									</span>
								</li>
							</ol>
						</li>
					</ul>
				</div>
			</div>
		</div>

	</div>

	<script>
		reset() {
			this.browseResults = [];
			this.artwork = null;
			this.artist = null;
			this.album = null;
			this.path = null;
			this.viewMode = "explorer"; // explorer/discography/album
		}

		browse(path) {
			fetch("api/browse/" + path, { credentials: "same-origin" })
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				
				this.reset();
				this.path = path;

				var length = data.length;
				var onlySongs = true;
				var allHaveAlbums = true;
				var hasAnyPicture = false;

				for (var i = 0; i < length; i++) {
					
					data[i].fields = data[i].Directory || data[i].Song;
					data[i].variant = data[i].Directory ? "Directory" : "Song";

					if (!data[i].fields.album) {
						allHaveAlbums = false;
					}

					if (data[i].fields.artwork) {
						data[i].fields.artwork = "api/serve/" + data[i].fields.artwork;
						hasAnyPicture = true;
					}

					if (data[i].variant == "Song") {
						data[i].fields.path = "api/serve/" + data[i].fields.path;
						this.album = this.album || data[i].fields.album;
						this.artwork = this.artwork || data[i].fields.artwork;
						this.artist = this.artist || data[i].fields.album_artist || data[i].fields.artist;
					} else {
						onlySongs = false;
						var slices = data[i].fields.path.replace(/\\/g, "/").split("/");
						slices = slices.filter(function(s) { return s.length > 0; });
						data[i].fields.name = slices[slices.length-1];
					}
				}

				if (hasAnyPicture && onlySongs && length > 0) {
					this.viewMode = "album";
				} else if (hasAnyPicture && allHaveAlbums) {
					this.viewMode = "discography";
				} else {
					this.viewMode = "explorer";
				}

				if (this.viewMode == "album") {
					var discs = [];
					for (var i = 0; i < length; i++) {
						var discNumber = data[i].fields.disc_number || 1;
						var disc = discs.find(function(d){ return d.discNumber == discNumber });
						if (disc == undefined) {
							disc = {
								discNumber: discNumber,
								songs: [],
							};
							discs.push(disc);
						}
						disc.songs.push(data[i]);
					}
					discs.sort(function(a,b){ return a.discNumber - b.discNumber; });
					this.browseResults = discs;
				} else {
					this.browseResults = data;
				}

				this.tags.breadcrumbs.setCurrentPath(path);
				this.update();
			}.bind(this));
		}

		onClickItem(e) {
			var variant = e.item.variant;
			if (variant == "Directory") {
				this.browse(e.item.fields.path);
			} else if (variant == "Song") {
				eventBus.trigger("browser:queueTrack", e.item.fields);
			}
		}

		onDragItemStart(e) {
			e.dataTransfer.setData("text/json", JSON.stringify(e.item));
		}

		onDragAlbumStart(e) {
			var directoryItem = {
				variant: "Directory",
				fields: {
					path: this.path,
					name: null,
					album: this.album,
				},
			};
			e.dataTransfer.setData("text/json", JSON.stringify(directoryItem));
		}

		eventBus.on("breadcrumbs:backtrack", function(path) {
			this.browse(path);
		}.bind(this));

		this.reset();
		this.browse("");
	</script>

	<style>
	
		browser .paneContent {
			padding: 40px;
		}

		/*Explorer view*/
		browser .explorerView {
			margin-top: -5px;
		}

		browser .explorerView .directory:before {
			content: "🗀";
			margin-right: 5px;
		}

		browser .explorerView .directory, browser .explorerView .song {
			cursor: default;
			max-width: 100%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		/*Discography view*/
		browser .discographyView {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
		}

		browser .discographyView .album {
			font-size: 0;
			margin-bottom: 20px;
			cursor: default;
		}

		browser .discographyView .album {
			width: 23.5%;
			margin-left: 1%;
			margin-right: 1%;
		}

		browser .discographyView .album:nth-child(4n+1) { margin-left: 0; }
		browser .discographyView .album:nth-child(4n) { margin-right: 0; }

		browser .discographyView .cover {
			width: 100%;
			position: relative;
		}

		/*Hack to make this element stay square when its width changes*/
		browser .discographyView .cover:after {
			content: "";
			display: block;
			padding-bottom: 100%;
		}

		browser .discographyView .coverCanvas {
			position: absolute;
			width: 100%;
  			height: 100%;
		}

		browser .discographyView img {
			width: 100%;
			height: 100%;
			border-radius: 5px;
		}

		browser .discographyView .details {
			padding: 5px 0; 
			width: 100%;
			font-size: 16px;
		}

		browser .discographyView .details .title {
			line-height: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			padding-right: 10px;
		}

		browser .discographyView .details .year {
			margin-top: -5px;
			font-size: 12px;
			color: #BBB;
		}

		/*Album view*/
		browser .albumView .title {
			line-height: 1;
			margin-top: -10px;
			margin-bottom: 5px;
			font-size: 30px;
			font-weight: 400;
		}

		browser .albumView .artist {
			line-height: 1;
			margin-bottom: 20px;
			font-size: 24px;
			color: #BBB;
		}

		browser .albumView .details {
			display: flex;
			flex-flow: row nowrap;
			justify-content: flex-start;
		}

		browser .albumView .trackList {
			flex-grow: 1;
			max-width: calc(100% - 40px);
			cursor: default;
			margin-left: 20px;
		}

		browser .albumView .discNumber {
			font-weight: 600;
			margin-bottom: 5px;
		}

		browser .albumView li:not(:first-child) .discNumber {
			margin-top: 20px;
		}

		browser .albumView .discContent {
			margin-left: 20px;
		}

		browser .albumView li.song {
			padding-top: 7px;
			padding-bottom: 3px;
			border-bottom: 1px solid #EEE;
			list-style-type: unset;
			list-style-position: outside;
		}

		browser .albumView .trackArtist {
			color: #BBB;
		}

		browser .albumView li:first-child {
			padding-top: 0;
		}

		browser .albumView li:last-child {
			border-bottom: 0;
		}

		browser .albumView img {
			flex-shrink: 0; 
			width: 100%;
			height: 100%;
			max-width: 15vw;
			max-height: 15vw;
			margin-bottom: 30px;
			border-radius: 5px;
		}

	</style>

</browser>