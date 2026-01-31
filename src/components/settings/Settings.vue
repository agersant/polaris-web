<template>
	<div class="flex flex-col">
		<PageHeader label="Settings" caption="Adjust color schemes and Polaris behavior." />
		<Tabs v-model="category" :tabs="tabs" />
		<div class="grow min-h-0 flex flex-col">
			<router-view />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ComputedRef } from 'vue';
import { useRouter } from 'vue-router';

import PageHeader from '@/components/basic/PageHeader.vue';
import Tabs, { TabItem } from '@/components/basic/Tabs.vue';
import { useUserStore } from '@/stores/user';

type Category = "preferences" | "collection" | "users" | "ddns";

const router = useRouter();
const user = useUserStore();

const tabs = computed(() => {
	let items: TabItem<Category>[] = [];
	items.push({ label: "Preferences", value: "preferences", testID: "preferences" });
	if (user.isAdmin) {
		items.push({ label: "Collection", value: "collection", testID: "collection" });
		items.push({ label: "Users", value: "users", testID: "users" });
		items.push({ label: "Dynamic DNS", value: "ddns", testID: "ddns" });
	}
	return items;
});

const category: ComputedRef<Category> = computed({
	get: () => {
		const path = router.currentRoute.value.path;
		if (path.endsWith("/collection")) {
			return "collection"
		} else if (path.endsWith("/users")) {
			return "users"
		} else if (path.endsWith("/ddns")) {
			return "ddns"
		} else {
			return "preferences";
		}
	},
	set: (value) => {
		switch (value) {
			case "preferences":
				router.push("/settings/preferences");
				break;
			case "collection":
				router.push("/settings/collection");
				break;
			case "users":
				router.push("/settings/users");
				break;
			case "ddns":
				router.push("/settings/ddns");
				break;
		}
	},
});

</script>
