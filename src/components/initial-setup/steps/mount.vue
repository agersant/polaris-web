<template>
	<div>
		<h2>Music Sources</h2>
		<p class="explanation">
			Please indicate which directories Polaris should scan to populate your collection.
			<br />You can change this or add more directories later from the settings screen.
		</p>
		<form v-on:submit.prevent="proceed">
			<div class="field">
				<table>
					<thead>
						<th>Location</th>
						<th class="name">Name</th>
						<th />
					</thead>
					<tr>
						<td>
							<input data-cy="source" type="text" v-model="source" placeholder="C:\MyMusic" />
						</td>
						<td class="name">
							<input data-cy="name" type="text" v-model="name" placeholder="Local Drive Music" />
						</td>
					</tr>
				</table>
			</div>
			<button data-cy="submit-mount-points" class="submit" v-bind:disabled="!validate()" v-bind:submit="true">Next</button>
		</form>
	</div>
</template>

<script>
import API from "/src/api";
export default {
	data() {
		return {
			name: "",
			source: "",
		};
	},

	methods: {
		validate() {
			return this.name && this.source;
		},

		proceed() {
			const mountDirs = [
				{
					name: this.name,
					source: this.source,
				},
			];
			this.$store.dispatch("mountDirs/set", mountDirs).then(API.triggerIndex);
		},
	},
};
</script>