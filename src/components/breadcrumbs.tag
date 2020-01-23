<breadcrumbs>

	<ul>
		<li data-cy="breadcrumb" class="noselect" each={ components } onclick={ onClickItem }>
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
    		display: flex;
			flex-shrink: 1;
    		flex-grow: 1;
    		min-height: 0;
		}

		ul {
			display: flex;
			font-size: 0.875rem;
			max-width: 100%;
		}

		li {
			display: inline-block;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			font-weight: 600;
			color: var(--theme-foreground-against-accent);
			background-color: var(--theme-accent);
			cursor: pointer;
			padding-left: 10px;
			padding-right: 10px;
			padding-top: 1px;
			border-radius: 5px;
			margin-right: 5px;
			flex-shrink: 0;
		}

		li:last-child {
			flex-shrink: 1;
			margin-right: 0;
		}
	</style>

</breadcrumbs>