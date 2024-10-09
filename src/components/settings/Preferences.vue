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
						<select @input="onBaseSelected" v-bind:value="preferences.effectiveTheme" data-cy="theme">
							<option v-for="theme of Object.values(Theme)" v-bind:key="theme" v-bind:value="theme">
								{{ getThemeName(theme) }}
							</option>
						</select>
					</td>
					<td class="accent-color">
						<input type="color" v-bind:value="preferences.effectiveAccentColor" @input="onAccentHovered"
							@change="onAccentSelected" data-cy="accent-color" />
					</td>
					<td>
						<i @click="preferences.resetTheming" class="noselect material-icons md-18"
							data-cy="reset-theming">restore</i>
					</td>
				</tr>
			</table>
		</div>
	</form>
</template>

<script setup lang="ts">
import { usePreferencesStore } from "@/stores/preferences";
import { getThemeName, Theme } from "@/theming/theming";

const preferences = usePreferencesStore();

function onAccentHovered(event: Event) {
	if (!event || !event.target) {
		return;
	}
	preferences.previewAccentColor((event.target as HTMLInputElement).value);
}

function onAccentSelected() {
	preferences.saveTheming();
}

function onBaseSelected(event: Event) {
	if (!event || !event.target) {
		return;
	}
	const theme = <Theme>((event.target as HTMLInputElement).value);
	preferences.previewTheme(theme);
	preferences.saveTheming();
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
