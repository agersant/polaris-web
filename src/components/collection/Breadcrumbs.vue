<template>
	<ul>
		<li data-cy="breadcrumb" class="noselect" v-for="component in components" v-bind:key="component.path"
			v-on:click="onClick(component)" v-bind:style="{ 'flex-shrink': Math.max(0, component.name.length - 9) }">
			{{ component.name }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

type Component = {
	name: string,
	path: string,
}

const route = useRoute();
const router = useRouter();
const path = ref("");

watch(
	() => [route.params.pathMatch, route.hash],
	([pathMatchRaw, hash]) => {
		let pathMatch: string[] = [];
		if (Array.isArray(pathMatchRaw)) {
			pathMatch = pathMatchRaw;
		}
		path.value = pathMatch.join("/") + (hash || "");
	},
	{immediate: true}
);

const components = computed((): Component[] =>{
	let components = [{
			name: "All Music",
			path: "",
	}];

	const separatorMatcher = /[\\/]/g;
	let previousLastIndex = 0;
	while (separatorMatcher.test(path.value)) {
		components.push({
			name: path.value.substring(previousLastIndex, separatorMatcher.lastIndex - 1),
			path: path.value.substring(0, separatorMatcher.lastIndex - 1),
		});
		previousLastIndex = separatorMatcher.lastIndex;
	}

	if (path.value) {
		components.push({
			name: path.value.substring(previousLastIndex),
			path: path.value,
		});
	}

	return components;
});

function onClick(component: Component) {
	router.push("/browse/" + component.path).catch(err => {});
}
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
