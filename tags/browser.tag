<browser>
	<h2>File Browser</h2>

	<breadcrumbs></breadcrumbs>

	<div if={ album }>
		<img if={ album.album_art } src="{ album.album_art }" width="200px" height="200px" />
		<div>{ album.artist }<br/>{ album.year } - { album.title }</div>
	</div>
	<ul>
		<li draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
			<img if={ variant == "Directory" && fields.album && fields.album.album_art } src="{ fields.album.album_art }" width="80px" height="80px" />
			<span if={ variant == "Directory" }>{ fields.name }</span>
			<span if={ variant == "Song" }>
				{ fields.artist } - { fields.track_number }. { fields.title }
			</span>
		</li>
	</ul>

	<script>
		reset() {
			this.browseResults = [];
			this.album = null;
		}

		browse(path) {
			fetch("api/browse/" + path, { credentials: "same-origin" })
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				this.reset();

				var length = data.length;
				for (var i = 0; i < length; i++) {
					data[i].fields = data[i].fields[0];
					if (data[i].fields.album && data[i].fields.album.album_art) {
						data[i].fields.album.album_art = "api/serve/" + data[i].fields.album.album_art;
					}
					if (data[i].variant == "Song" && !this.album) {
						this.album = data[i].fields.album;
					}
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

</browser>