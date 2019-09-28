<breadcrumbs>

	<ul>
		<li class="noselect" each={ components } onclick={ onClickItem }>
			{ name }
		</li>
	</ul>

	<script>

		this.components = [];

		setCurrentPath(path) {
			var components = [{
				name: "All Music",
				path: "",
			}];

			var separatorMatcher = /[\\/]/g;
			var previousLastIndex = 0;
			while (separatorMatcher.test(path)) {
				components.push({
					name: path.substring(previousLastIndex, separatorMatcher.lastIndex - 1),
					path: path.substring(0, separatorMatcher.lastIndex - 1),
				});
				previousLastIndex = separatorMatcher.lastIndex;
			}

			if (path) {
				components.push({
					name: path.substring(previousLastIndex),
					path: path,
				});
			}

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