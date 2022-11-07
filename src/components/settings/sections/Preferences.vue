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
						<select ref="base" @input="onBaseSelected" v-bind:value="user.theme">
							<option v-for="base in listBases()" v-bind:key="base.id" v-bind:value="base.id">
								{{ base.name }}
							</option>
						</select>
					</td>
					<td class="accent-color">
						<input ref="accent" type="color" v-bind:value="user.accent" @input="onAccentHovered"
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
			<div v-if="user.lastFMUsername">
				<p class="explanation">
					You are scrobbling music as
					<a href="https://www.last.fm/user/{lastFMUsername()}" target="_blank">{{ user.lastFMUsername }}</a>.
				</p>
				<button v-on:click="unlinkLastFMAccount">Unlink Last.fm account</button>
			</div>
			<div v-if="!user.lastFMUsername">
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
import { useUserStore } from "@/stores/user";
import { getDefaultAccent, getDefaultBaseID, listBases } from "@/theming/theming";

const user = useUserStore();

function onAccentHovered(event: Event) {
	if (!event || !event.target) {
		return;
	}
	user.previewThemeAccent((event.target as HTMLInputElement).value);
}

function onAccentSelected() {
	user.saveTheme();
}

function onBaseSelected(event: Event) {
	if (!event || !event.target) {
		return;
	}
	user.previewThemeBase((event.target as HTMLInputElement).value);
	user.saveTheme();
}

function resetTheme() {
	user.previewThemeBase(getDefaultBaseID());
	user.previewThemeAccent(getDefaultAccent());
	user.saveTheme();
}

function linkLastFMAccount() {
	user.linkLastFM();
}

function unlinkLastFMAccount() {
	user.unlinkLastFM();
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
