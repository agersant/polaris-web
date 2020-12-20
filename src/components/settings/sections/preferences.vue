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

		linkLastFMAccount(e) {
			let apiKey = "02b96c939a2b451c31dfd67add1f696e";
			let currentURL = new URL(window.location.href);
			let username = Cookies.get("username");
			let successPopupContent = btoa(
				`<!doctype html>
				<html>
					<head>
						<title>Polaris</title>
						<meta charset="UTF-8">
					</head>
					<body>
						<script type="text/javascript">
							window.opener.postMessage("polaris-lastfm-auth-success", "*");
						<\/script>
					</body>
				</html>`
			);
			// TODO use link_token
			let callbackURL = currentURL.protocol + "//" + currentURL.host + "/api/lastfm/link?content=" + encodeURIComponent(successPopupContent);
			let url = "https://www.last.fm/api/auth/?api_key=" + apiKey + "&cb=" + encodeURIComponent(callbackURL);
			let windowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
			let lastFMPopup = window.open(url, "Link Last.fm account", windowFeatures);
			window.addEventListener(
				"message",
				event => {
					if (event.source != lastFMPopup) {
						return;
					}
					if (event.data == "polaris-lastfm-auth-success") {
						lastFMPopup.close();
						this.$store.dispatch("user/refreshPreferences");
					}
				},
				false
			);
		},

		unlinkLastFMAccount(e) {
			// TODO
			API.lastFMUnlink().then(this.refreshPreferences);
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
