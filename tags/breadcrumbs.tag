<breadcrumbs>

	<ul>
		<li class="noselect" each={ components } onclick={ onClickItem }>
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
			display: block;
			height: 20px;
		}

		ul {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			font-size: 0.875rem;
			color: white;
		}

		li {
			display: inline;
			color: #FFF;
			background-color: #44C8F1;
			cursor: pointer;
			padding-left: 8px;
			padding-right: 5px;
			border-radius: 5px;
			margin-right: 5px;
		}

		li:last-child {
			padding-right: 8px;
		}
	</style>

</breadcrumbs>