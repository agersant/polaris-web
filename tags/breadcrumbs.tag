<breadcrumbs>

	<ul>
		<li each={ components } onclick={ onClickItem }>
			{ name }
		</li>
	</ul>

	<script>

		this.components = [];

		setCurrentPath(path) {
			path = path.replace(/\\/g, "/");
			var slices = path.split("/");
			slices = slices.filter(function(s) { return s.length > 0; });
			var components = slices.map(function(slice, index) {
				return {
					name: slice,
					path: slices.slice(0, index + 1).join("/"),
				};
			});
			components.unshift({
				name: "All Music",
				path: "",
			});
			this.components = components;
			this.update();
		}

		onClickItem(e) {
			route("browse/" + e.item.path);
		}

	</script>

	<style>
		breadcrumbs ul {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		breadcrumbs li {
			display: inline;
			cursor: pointer;
		}
		breadcrumbs li:not(:first-child):before {
			content: " > ";
		}
	</style>

</breadcrumbs>