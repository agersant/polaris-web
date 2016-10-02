<browser>

	<div class="paneHeader">
		<h2>Music Collection</h2>
		<breadcrumbs></breadcrumbs>
	</div>

	<div class="paneContent">

		<ul if={ viewMode == "explorer" } class="explorerView">
			<li draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<span if={ variant == "Directory" } class="directory">{ fields.name }</span>
				<span if={ variant == "Song" } class="song">{ fields.artist } - { fields.track_number }. { fields.title }</span>
			</li>
		</ul>

		<ul if={ viewMode == "discography" } class="discographyView">
			<li class="album" draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<div class="cover">
					<div class="coverCanvas">
						<img if={ fields.album && fields.album.album_art } src="{ fields.album.album_art }"/>
					</div>
				</div>
				<div class="details">
					<div class="title">{ fields.album.title }</div>
					<div class="year">{ fields.album.year }</div>
				</div>
			</li>
		</ul>

		<div if={ viewMode == "album" } class="albumView">
			<div class="details">
				<img src="{ album.album_art }" />
				<div>{ album.year }</div>
				<div>{ album.title }</div>
			</div>
			<ul>
				<li draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
					<span>{ fields.track_number }. { fields.title }</span>
				</li>
			</ul>
		</div>

	</div>

	<script>
		reset() {
			this.browseResults = [];
			this.album = null;
			this.viewMode = "explorer"; // explorer/discography/album
		}

		browse(path) {
			fetch("api/browse/" + path, { credentials: "same-origin" })
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				
				this.reset();
				var length = data.length;
				var onlySongs = true;
				var allSameAlbum = true;
				var allHaveAlbums = true;
				var hasAnyPicture = false;

				for (var i = 0; i < length; i++) {
					
					data[i].fields = data[i].fields[0];
					
					var album = data[i].fields.album;

					if (album && album.title) {
						if (data[i].fields.album.album_art) {
							data[i].fields.album.album_art = "api/serve/" + data[i].fields.album.album_art;
							hasAnyPicture = true;
						}
					} else {
						allHaveAlbums = false;
					}

					if (data[i].variant == "Song") {
						if (!this.album) {
							this.album = album;
						} else if (this.album.title != album.title) {
							allSameAlbum = false;
						}
					} else {
						onlySongs = false;
					}
				}

				if (hasAnyPicture && allSameAlbum && onlySongs && length > 0) {
					this.viewMode = "album";
				} else if (hasAnyPicture && allHaveAlbums) {
					this.viewMode = "discography";
				} else {
					this.viewMode = "explorer";
				}

				this.browseResults = data;
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
			return true;
		}

		eventBus.on("breadcrumbs:backtrack", function(path) {
			this.browse(path);
		}.bind(this));

		this.reset();
		this.browse("");
	</script>

	<style>

		/*Explorer view*/
		browser .explorerView .directory:before {
			content: "🗀";
			margin-right: 5px;
		}

		browser .explorerView .directory, browser .explorerView .song {
			white-space: nowrap;
			cursor: default;
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
			width: 16%;
			margin-left: 0.4%;
			margin-right: 0.4%;
		}

		browser .discographyView .album:nth-child(6n+1) { margin-left: 0; }
		browser .discographyView .album:nth-child(6n) { margin-right: 0; }

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
		}

		browser .discographyView .details {
			padding: 5px 0; 
			width: 100%;
			font-size: 16px;
		}

		browser .discographyView .details .title {
			white-space: nowrap;
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
		browser .albumView .details {
			float: left;
			width: 400px;
			margin-bottom: 20px;
			margin-right: 20px;
		}

		browser .albumView .details img {
			width: 100%;
		}

		browser .albumView ul {
			float: left;
			cursor: default;
		}
	</style>

</browser>