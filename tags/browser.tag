<browser>
	<h2>File Browser</h2>

	<breadcrumbs></breadcrumbs>

	<img if={ folderArt } src="{ folderArt }" width="200px" height="200px" />
	<ul>
		<li draggable="true" each={ browseResults } onclick={ onClickItem } ondragstart={ onDragItemStart }>
			<img if={ variant == "Directory" && fields.folderArt } src="{ fields.folderArt }" width="80px" height="80px" />
			{ variant == "Directory" ? fields.name : fields.title }
		</li>
	</ul>

	<script>
		reset() {
			this.browseResults = [];
			this.folderArt = null;
		}

		browse(path) {
			fetch('api/browse/' + path)
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				this.reset();

				var length = data.length;
				for (var i = 0; i < length; i++) {
					data[i].fields = data[i].fields[0];
					if (data[i].fields.album.album_art) {
						data[i].fields.folderArt = "api/serve/" + data[i].fields.album.album_art;
					} else {
						data[i].fields.folderArt = null;
					}
					if (data[i].variant == "Song") {
						this.folderArt = data[i].fields.folderArt;
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