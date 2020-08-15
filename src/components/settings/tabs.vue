<template>
	<div>
		<span
			v-for="tab in tabs"
			v-bind:key="tab.name"
			v-on:click="onClickTab(tab)"
			v-bind:class="{noselect: 1, selected: currentTab == tab }"
		>{{ tab.name }}</span>
	</div>
</template>

<script>
import Cookies from "js-cookie";
export default {
	data() {
		return {
			tabs: [],
			currentTab: "",
		};
	},

	mounted() {
		this.tabs = [{ name: "Preferences", path: "preferences" }];
		if (Cookies.get("admin") == "true") {
			this.tabs.push({ name: "Collection", path: "collection" });
			this.tabs.push({ name: "Users", path: "users" });
			this.tabs.push({ name: "Dynamic DNS", path: "ddns" });
		}
		this.updateCurrentTab();
	},

	watch: {
		$route(to, from) {
			this.updateCurrentTab();
		},
	},

	methods: {
		updateCurrentTab() {
			let pathEnd = this.$route.path.split("/").pop();
			this.currentTab = this.tabs.find(tab => pathEnd.includes(tab.path));
		},

		onClickTab(tab) {
			this.$router.push("/settings/" + tab.path).catch(err => {});
		},
	},
};
</script>

<style scoped>
span {
	cursor: pointer;
	color: var(--theme-foreground-muted);
	line-height: 1;
	font-size: 1rem;
}

span + span {
	margin-left: 20px;
}

.selected {
	color: var(--theme-accent);
	border-bottom: 1px solid var(--theme-accent);
}
</style>