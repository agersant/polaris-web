<template>
	<div v-bind:style="theme">
		<router-view></router-view>
	<div>
</template>

<script>
import * as Theming from "/src/theming/theming";

export default {
	computed: {
		theme() {
			const themeBase = this.$store.getters["user/themeBase"];
			const themeAccent = this.$store.getters["user/themeAccent"];
			return Theming.getThemeColors(themeBase, themeAccent);
		},
	},

	created() {
		if (this.$store.getters["user/isLoggedIn"]) {
			this.$store.dispatch("user/refreshPreferences");
		}
	},
};
</script>

<style scoped>
div {
	height: 100%;
}
</style>