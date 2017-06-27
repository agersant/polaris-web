<browser>

	<div class="paneHeader">
		<h2>{ title }</h2>
		<div if={ tab == "random" } class="more noselect" onclick={ onClickMoreRandom }><i class="material-icons md-18">refresh</i><span>More</span></div>
		<breadcrumbs if={ path != null }/>
	</div>

	<div class="paneContent">
		<ul if={ viewMode == "explorer" } class="explorerView">
			<li draggable="true" each={ items } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<div if={ variant == "Directory" } class="directory">{ fields.name }</div>
				<div if={ variant == "Song" } class="song">{ fields.artist } - { fields.track_number }. { fields.title }</div>
			</li>
		</ul>

		<ul if={ viewMode == "discography" } class="discographyView">
			<li class="album" draggable="true" each={ items } onclick={ onClickItem } ondragstart={ onDragItemStart }>
				<div class="cover">
					<div class="coverCanvas">
						<img if={ fields.artwork } src="{ fields.artwork }"/>
					</div>
				</div>
				<div class="details">
					<div class="title">{ fields.album }</div>
					<div if={ path == null } class="artist">{ fields.artist }</div>
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
						<li each={ items } >
							<div class="discNumber" if="{ items.length > 1 }">Disc { discNumber }</div>
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

		var self = this;

		reset() {
			this.items = [];
			this.artwork = null;
			this.artist = null;
			this.album = null;
			this.path = null;
			this.title = "";
			this.viewMode = "explorer"; // explorer/discography/album
		}

		var r = route.create();
    	r("", browse);
    	r("browse..", browse);
    	r("random", random);
    	r("recent", recent);
		this.on('mount', function() {
			route.exec();
		});

		getViewMode(items) {
			var onlySongs = true;
			var allHaveAlbums = true;
			var hasAnyPicture = false;

			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (!item.fields.album) {
					allHaveAlbums = false;
				}

				if (item.fields.artwork) {
					item.fields.artwork = "api/serve/" + encodeURIComponent(item.fields.artwork);
					hasAnyPicture = true;
				}

				if (item.variant == "Song") {
					item.fields.path = "api/serve/" + encodeURIComponent(item.fields.path);
					this.album = this.album || item.fields.album;
					this.artwork = this.artwork || item.fields.artwork;
					this.artist = this.artist || item.fields.album_artist || item.fields.artist;
				} else {
					onlySongs = false;
					var slices = item.fields.path.replace(/\\/g, "/").split("/");
					slices = slices.filter(function(s) { return s.length > 0; });
					item.fields.name = slices[slices.length-1];
				}
			}

			if (hasAnyPicture && onlySongs && items.length > 0) {
				return "album";
			} else if (hasAnyPicture && allHaveAlbums) {
				return "discography";
			} else {
				return "explorer";
			}
		}

		splitAlbumByDisc(items) {
			var discs = [];
			for (var i = 0; i < items.length; i++) {
				var discNumber = items[i].fields.disc_number || 1;
				var disc = discs.find(function(d){ return d.discNumber == discNumber });
				if (disc == undefined) {
					disc = {
						discNumber: discNumber,
						songs: [],
					};
					discs.push(disc);
				}
				disc.songs.push(items[i]);
			}
			discs.sort(function(a,b){ return a.discNumber - b.discNumber; });
			return discs;
		}

		displayItems(items) {
			this.viewMode = this.getViewMode(items);
			if (this.viewMode == "album") {
				this.items = this.splitAlbumByDisc(items);
			} else {
				this.items = items;
			}
			this.update();
		}

		function random() {
			fetch("api/random/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.reset();
				for (var i = 0; i < data.length; i++) {
					data[i] = {
						variant: "Directory",
						fields: data[i],
					}
				}
				this.tab = "random";
				this.title = "Random Albums";
				this.displayItems(data);
			}.bind(self));
		}

		function recent() {
			fetch("api/recent/", { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.reset();
				for (var i = 0; i < data.length; i++) {
					data[i] = {
						variant: "Directory",
						fields: data[i],
					}
				}
				this.tab = "recent";
				this.title = "Recently Added";
				this.displayItems(data);
			}.bind(self));
		}

		function browse(path) {
			var matchPath = /^.*#browse\/?(.*)$/;
			var matches = window.location.href.match(matchPath);
			var path = matches ? matches[1] : "";
			path = decodeURIComponent(path);

			fetch("api/browse/" + path, { credentials: "same-origin" })
			.then(function(res) { return res.json(); })
			.then(function(data) {
				this.reset();
				this.path = path;
				for (var i = 0; i < data.length; i++) {
					data[i].fields = data[i].Directory || data[i].Song;
					data[i].variant = data[i].Directory ? "Directory" : "Song";
				}
				this.tab = "browse";
				this.title = "Music Collection";
				this.displayItems(data);
				this.tags.breadcrumbs.setCurrentPath(path);
			}.bind(self));
		}

		onClickMoreRandom(e) {
			e.preventDefault();
			route.exec();
		}

		onClickItem(e) {
			var variant = e.item.variant;
			if (variant == "Directory") {
				route("browse/" + e.item.fields.path);
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
				},
			};
			e.dataTransfer.setData("text/json", JSON.stringify(directoryItem));
		}	
	</script>

	<style>

		.more {
			cursor: pointer;
			height: 20px;
		}

		.more span {
			padding-left: 4px;
			font-size: 14px;
			vertical-align: top;
		}

		.paneContent {
			padding-top: 40px;
		}

		/*Explorer view*/
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

		browser .discographyView .cover:after {
			/*Hack to make this element stay square when its width changes*/
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
			padding: 10px 0; 
			width: 100%;
		}

		browser .discographyView .details .title {
			line-height: 95%;
			overflow: hidden;
			text-overflow: ellipsis;
			padding-right: 10px;
			font-size: 18px;
			font-weight: 400px;
		}

		browser .discographyView .details .artist {
			margin-bottom: -5px;
			overflow: hidden;
			text-overflow: ellipsis;
			padding-right: 10px;
			font-size: 14px;
		}

		browser .discographyView .details .year {
			font-size: 14px;
			color: #AAA;
		}

		/*Album view*/
		browser .albumView .title {
			line-height: 1;
			margin-bottom: 5px;
			font-size: 20px;
			font-family: "Montserrat", "sans-serif";
		}

		browser .albumView .artist {
			line-height: 1;
			margin-bottom: 20px;
			font-size: 20px;
			color: #AAA;
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
			padding-top: 8px;
			padding-bottom: 6px;
			border-bottom: 1px solid #DDD;
			list-style-type: unset;
			list-style-position: outside;
		}

		browser .albumView .trackArtist {
			color: #AAA;
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