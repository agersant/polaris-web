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
							<input data-cy="source" type="text" v-model="mountDir.source" placeholder="C:\MyMusic" />
						</td>
						<td class="name">
							<input data-cy="name" type="text" v-model="mountDir.name" placeholder="Local Drive Music" />
						</td>
					</tr>
				</table>
			</div>
			<button data-cy="submit-mount-points" class="submit" v-bind:disabled="!validate()"
				v-bind:submit="true">Next</button>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import { MountDir } from "@/api/dto";
import { useMountDirsStore } from "@/stores/mount-dirs";
import { triggerIndex } from "@/api/endpoints";

const mountDirs = useMountDirsStore();

const mountDir: Ref<MountDir> = ref({
	name: "",
	source: "",
});

function validate(): boolean {
	return !!mountDir.value.name && !!mountDir.value.source;
}

async function proceed() {
	await mountDirs.overwrite([mountDir.value]);
	triggerIndex();
}
</script>