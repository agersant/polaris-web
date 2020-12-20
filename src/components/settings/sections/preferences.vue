<template>
	<form v-on:submit.prevent>
		<div class="field">
			<label>Theme</label>
			<table>
				<thead>
					<th>Mode</th>
					<th>Color</th>
					<th />
				</thead>
				<tr>
					<td>
						<select ref="base" v-on:input="onBaseSelected" v-bind:value="themeBase()">
							<option v-for="base in bases" v-bind:key="base.id" v-bind:value="base.id">{{ base.name }}</option>
						</select>
					</td>
					<td class="accent-color">
						<input ref="accent" type="color" v-bind:value="themeAccent()" v-on:input="onAccentHovered" v-on:change="onAccentSelected" />
					</td>
					<td>
						<i v-on:click="resetTheme" class="noselect material-icons md-18">restore</i>
					</td>
				</tr>
			</table>
		</div>
		<div class="field">
			<label for="lastfm_username">Last.fm scrobbling</label>
			<div v-if="lastFMUsername()">
				<p class="explanation">
					You are scrobbling music as
					<a href="https://www.last.fm/user/{lastFMUsername()}" target="_blank">{{ lastFMUsername() }}</a
					>.
				</p>
				<button v-on:click="unlinkLastFMAccount">Unlink Last.fm account</button>
			</div>
			<div v-if="!lastFMUsername()">
				<p class="explanation">
					Polaris can automatically submit songs you play to
					<a href="https://www.last.fm/" target="_blank">Last.fm</a>.
				</p>
				<button v-on:click="linkLastFMAccount">Link Last.fm account</button>
			</div>
		</div>
	</form>
</template>

<script>
import Cookies from "js-cookie";
import { mapGetters } from "vuex";
import API from "/src/api";
import * as Theming from "/src/theming/theming";
export default {
	data() {
		return {
			...mapGetters({
				themeBase: "user/themeBase",
				themeAccent: "user/themeAccent",
				lastFMUsername: "user/lastFMUsername",
			}),
			bases: Theming.listBases(),
		};
	},

	methods: {
		onAccentHovered(event) {
			this.$store.commit("user/previewThemeAccent", event.target.value);
		},

		onAccentSelected() {
			this.saveTheme();
		},

		onBaseSelected(event) {
			this.$store.commit("user/previewThemeBase", event.target.value);
			this.saveTheme();
		},

		resetTheme() {
			this.$store.commit("user/previewThemeBase", Theming.getDefaultBase());
			this.$store.commit("user/previewThemeAccent", Theming.getDefaultAccent());
			this.saveTheme();
		},

		saveTheme() {
			this.$store.dispatch("user/saveTheme");
		},

		linkLastFMAccount() {
			this.$store.dispatch("user/linkLastFM");
		},

		unlinkLastFMAccount() {
			this.$store.dispatch("user/unlinkLastFM");
		},
	},
};
</script>

<style scoped>
a {
	text-decoration: underline;
	color: var(--theme-accent);
}

td.accent-color {
	background-color: var(--theme-accent);
}

input[type="color"] {
	opacity: 0;
}
</style>
