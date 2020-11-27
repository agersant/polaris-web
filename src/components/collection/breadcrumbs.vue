<template>
	<ul>
		<li
			data-cy="breadcrumb"
			class="noselect"
			v-for="component in components"
			v-bind:key="component.path"
			v-on:click="onClick(component)"
			v-bind:style="{ 'flex-shrink': Math.max(0, component.name.length - 9) }"
		>
			{{ component.name }}
		</li>
	</ul>
</template>

<script>
export default {
	data() {
		return {
			components: [],
		};
	},

	mounted() {
		this.updatePath();
	},

	watch: {
		$route(to, from) {
			this.updatePath();
		},
	},

	methods: {
		updatePath() {
			let path = this.$route.params.pathMatch + this.$route.hash || "";
			if (path.startsWith("/")) {
				path = path.substring(1);
			}
			path = decodeURIComponent(path);

			let components = [
				{
					name: "All Music",
					path: "",
				},
			];

			let separatorMatcher = /[\\/]/g;
			let previousLastIndex = 0;
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
		},

		onClick(component) {
			this.$router.push("/browse/" + component.path).catch(err => {});
		},
	},
};
</script>

<style scoped>
ul {
	display: flex;
	font-size: 0.875rem;
	max-width: 100%;
}

li {
	display: inline-block;
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
}

li:last-child {
	margin-right: 0;
}
</style>
