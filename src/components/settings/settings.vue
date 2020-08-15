<template>
	<div class="left pane">
		<div class="paneHeader">
			<h2>Settings</h2>
			<tabs></tabs>
		</div>

		<div class="paneContent">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
import Tabs from "./tabs";
export default {
	components: {
		tabs: Tabs,
	},
};
</script>
