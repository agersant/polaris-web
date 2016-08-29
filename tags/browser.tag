<browser>
	<h2>File Browser</h2>

	<ul>
		<li each={ browseResults } onclick={ onClickItem }>
			{ fields.display_name }
		</li>
	</ul>

	<script>
		reset() {
			this.browseResults = [];
		}

		browse(path) {
			fetch('api/browse/' + path)
			.then(function(res) {
				return res.json();
			})
			.then(function(data) {
				var length = data.length;
				for (var i = 0; i < length; i++) {
					data[i].fields = data[i].fields[0];
				}
				
				this.reset();
				this.browseResults = data;
				this.update();
			}.bind(this));
		}

		onClickItem(e) {
			var variant = e.item.variant;
			if (variant == "Directory") {
				this.browse(e.item.fields.path);
			} else if (variant == "Song") {
				eventBus.trigger("playlist:queue", e.item);
			}
		}

		this.reset();
		this.browse("");
	</script>

</browser>