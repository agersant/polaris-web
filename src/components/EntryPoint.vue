<template>
	<div>
		<router-view v-if="initialSetup.isStateKnown" />
	</div>
</template>

<script setup lang="ts">
import { watchEffect, onMounted } from "vue"
import { applyTheme } from "@/theming/theming";
import { useInitialSetupStore } from "@/stores/initial-setup";
import { usePlaylistStore } from "@/stores/playlist";
import { useUserStore } from "@/stores/user";

	const initialSetup = useInitialSetupStore();
	const playlist = usePlaylistStore();
	const user = useUserStore();

	watchEffect(() => {
		applyTheme(user.theme, user.accent);
	});

	onMounted(async () => {
		// TODO find a better home for this
		if (user.isLoggedIn) {
			user.refreshPreferences();
		}
	});
</script>

<style scoped>
div {
	height: 100%;
}
</style>