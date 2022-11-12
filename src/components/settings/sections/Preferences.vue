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
						<select ref="base" @input="onBaseSelected" v-bind:value="preferences.theme">
							<option v-for="base in listBases()" v-bind:key="base.id" v-bind:value="base.id">
								{{ base.name }}
							</option>
						</select>
					</td>
					<td class="accent-color">
						<input ref="accent" type="color" v-bind:value="preferences.accent" @input="onAccentHovered"
							@change="onAccentSelected" />
					</td>
					<td>
						<i @click="resetTheme" class="noselect material-icons md-18">restore</i>
					</td>
				</tr>
			</table>
		</div>
		<div class="field">
			<label for="lastfm_username">Last.fm scrobbling</label>
			<div v-if="preferences.lastFMUsername">
				<p class="explanation">
					You are scrobbling music as
					<a href="https://www.last.fm/user/{lastFMUsername()}" target="_blank">{{ preferences.lastFMUsername
					}}</a>.
				</p>
				<button v-on:click="unlinkLastFMAccount">Unlink Last.fm account</button>
			</div>
			<div v-if="!preferences.lastFMUsername">
				<p class="explanation">
					Polaris can automatically submit songs you play to
					<a href="https://www.last.fm/" target="_blank">Last.fm</a>.
				</p>
				<button v-on:click="linkLastFMAccount">Link Last.fm account</button>
			</div>
		</div>
	</form>
</template>

<script setup lang="ts">
import { usePreferencesStore } from "@/stores/preferences";
import { getDefaultAccent, getDefaultBaseID, listBases } from "@/theming/theming";

const preferences = usePreferencesStore();

function onAccentHovered(event: Event) {
	if (!event || !event.target) {
		return;
	}
	preferences.previewThemeAccent((event.target as HTMLInputElement).value);
}

function onAccentSelected() {
	preferences.saveTheme();
}

function onBaseSelected(event: Event) {
	if (!event || !event.target) {
		return;
	}
	preferences.previewThemeBase((event.target as HTMLInputElement).value);
	preferences.saveTheme();
}

function resetTheme() {
	preferences.previewThemeBase(getDefaultBaseID());
	preferences.previewThemeAccent(getDefaultAccent());
	preferences.saveTheme();
}

function linkLastFMAccount() {
	preferences.linkLastFM();
}

function unlinkLastFMAccount() {
	preferences.unlinkLastFM();
}
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
