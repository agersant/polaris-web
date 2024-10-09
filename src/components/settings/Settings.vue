<template>
	<div class="pane">
		<div class="paneHeader">
			<h2>Settings</h2>
			<Tabs />
		</div>
		<div class="paneContent">
			<router-view></router-view>
		</div>
	</div>
</template>

<script setup lang="ts">
import Tabs from "./Tabs.vue";
</script>

<style scoped>
.paneHeader {
	padding-bottom: 0px;
	justify-content: space-between;
	overflow: visible;
}
</style>