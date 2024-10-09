<template>
	<div>
		<span v-for="tab in tabs" v-bind:key="tab.name" v-on:click="onClickTab(tab)"
			v-bind:class="{ noselect: 1, selected: currentTab == tab }" v-bind:data-cy="tab.cy">
			{{ tab.name }}
		</span>
	</div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref, onMounted, Ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

type TabDefinition = {
	cy: string,
	name: string,
	path: string,
};

const route = useRoute();
const router = useRouter();
const user = useUserStore();

const tabs: Ref<TabDefinition[]> = ref([]);
const currentTab: Ref<TabDefinition | null> = ref(null);

onMounted(()=> {
	tabs.value = [{ cy:"preferences", name: "Preferences", path: "preferences" }];
	if (user.isAdmin) {
		tabs.value.push({ cy:"collection", name: "Collection", path: "collection" });
		tabs.value.push({ cy:"users", name: "Users", path: "users" });
		tabs.value.push({ cy:"ddns", name: "Dynamic DNS", path: "ddns" });
	}
	updateCurrentTab();
});

watch(route, (to, from) => {
	updateCurrentTab();
});

function updateCurrentTab() {
	const pathEnd = route.path.split("/").pop() || "";
	const newTab = tabs.value.find(tab => pathEnd.includes(tab.path));
	if (newTab) {
		currentTab.value = newTab;
	}
}

function onClickTab(tab: TabDefinition) {
	router.push("/settings/" + tab.path).catch(err => {});
}
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
