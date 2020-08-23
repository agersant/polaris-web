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
	padding-left: 15px;
	padding-right: 15px;
	padding-top: 2px;
	font-size: 1rem;
	border: 1px solid var(--theme-background-muted);
	border-bottom: 1px solid var(--theme-border-muted);
	background-color: var(--theme-background-muted);
}

span:first-child {
	border-radius: 3px 0 0 0;
}

span:last-child {
	border-radius: 0 3px 0 0;
}

span.selected {
	color: var(--theme-accent);
	font-weight: 400;
	border: 1px solid var(--theme-border-muted);
	border-bottom: 1px solid var(--theme-background);
	border-radius: 3px 3px 0 0;
	background-color: var(--theme-background);
}
</style>
