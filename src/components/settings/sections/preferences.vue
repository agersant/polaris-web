<template>
	<form v-if="preferences">
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
						<select ref="base" v-on:change="onBaseSelected" v-model="preferences.web_theme_base">
							<option v-for="base in bases" v-bind:key="base.id" v-bind:value="base.id">{{ base.name }}</option>
						</select>
					</td>
					<td class="accent-color">
						<input
							ref="accent"
							type="color"
							v-model="preferences.web_theme_accent"
							v-on:input="onAccentPreview"
							v-on:change="onAccentSelected"
						/>
					</td>
					<td>
						<i v-on:click="resetTheme" class="noselect material-icons md-18">restore</i>
					</td>
				</tr>
			</table>
		</div>
		<div class="field">
			<label for="lastfm_username">Last.fm scrobbling</label>
			<div v-if="preferences.lastfm_username">
				<p class="explanation">
					You are scrobbling music as
					<a
						href="https://www.last.fm/user/{preferences.lastfm_username}"
						target="_blank"
					>{{ preferences.lastfm_username }}</a>.
				</p>
				<button v-on:click="unlinkLastFMAccount">Unlink Last.fm account</button>
			</div>
			<div v-if="!preferences.lastfm_username">
				<p class="explanation">
					Polaris can automatically submit songs you play to
					<a
						href="https://www.last.fm/"
						target="_blank"
					>Last.fm</a>.
				</p>
				<button v-on:click="linkLastFMAccount">Link Last.fm account</button>
			</div>
		</div>
	</form>
</template>

<script>
import Cookies from "js-cookie";
import * as Theming from "/src/theming/theming";
export default {
	data() {
		return {
			preferences: null,
			bases: Theming.listBases()
		};
	},

	mounted() {
		this.refreshPreferences();
	},

	methods: {
		refreshPreferences() {
			this.$api
				.request("/preferences")
				.then(res => res.json())
				.then(data => {
					this.preferences = data;
					if (!this.preferences.web_theme_base) {
						this.preferences.web_theme_base = Theming.getCurrentBase();
					}
					if (!this.preferences.web_theme_accent) {
						this.preferences.web_theme_accent = Theming.getCurrentAccentColor();
					}
				});
		},

		onAccentPreview() {
			Theming.setAccentColor(this.preferences.web_theme_accent);
		},

		onAccentSelected() {
			Theming.setAccentColor(this.preferences.web_theme_accent);
			this.commit();
		},

		onBaseSelected() {
			Theming.setBase(this.preferences.web_theme_base);
			this.commit();
		},

		resetTheme() {
			Theming.setBase(null);
			Theming.setAccentColor(null);
			this.preferences.web_theme_base = Theming.getCurrentBase();
			this.preferences.web_theme_accent = Theming.getCurrentAccentColor();
			this.commit();
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
						this.refreshPreferences();
					}
				},
				false
			);
		},

		unlinkLastFMAccount(e) {
			this.$api.request("/lastfm/link", { method: "DELETE" }).then(this.refreshPreferences);
		},

		commit() {
			this.$api.request("/preferences", {
				method: "PUT",
				body: JSON.stringify(this.preferences),
				headers: {
					"Content-Type": "application/json"
				}
			});
		}
	}
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
