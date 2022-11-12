<template>
	<div>
		<router-view v-if="initialSetup.isStateKnown" />
	</div>
</template>

<script setup lang="ts">
import { useInitialSetupStore } from "@/stores/initial-setup";
const initialSetup = useInitialSetupStore();
</script>

<style scoped>
div {
	height: 100%;
}
</style>