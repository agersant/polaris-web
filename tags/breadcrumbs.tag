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
		breadcrumbs {
			margin-top: 40px;
			display: block;
		}

		ul {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			padding-left: 5px;
			padding-right: 10px;
			font-size: 14px;
			color: white;

			margin-left: 32px;
			margin-right: 32px;
		}

		li {
			display: inline;

			color: white;
			cursor: pointer;

			padding-left: 8px;
			padding-right: 5px;
			background-color: #44C8F1;
			border-radius: 5px;
		}
		
		li + li {
			margin-left: 5px;
		}
	</style>

</breadcrumbs>