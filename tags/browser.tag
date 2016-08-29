<browser>
	<span>Hello World!</span>
	<ul>
		<li each={ browseResults }>
			<a onclick={ browseTo }>{ fields.display_name }</a>
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

		browseTo(e) {
			this.browse(e.item.fields.path);
		}

		this.reset();
		this.browse("");
	</script>

</browser>