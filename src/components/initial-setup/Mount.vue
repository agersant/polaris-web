<template>
	<div class="flex flex-col gap-4">
		<h2 class="text-2xl font-semibold text-ls-900 dark:text-ds-200">Music Sources</h2>
		<p class="mb-4 text-ls-500 dark:text-ds-400">
			Please indicate which directory Polaris should scan to populate your music collection.
		</p>
		<div class="flex items-stretch gap-6">
			<InputText class="grow" v-model="mountDir.source" id="location" name="location" label="Location"
				placeholder="C:\MyMusic" required />
			<InputText class="grow" v-model="mountDir.name" id="name" name="name" label="Name"
				placeholder="Local Drive Music" required />
		</div>
		<Button data-cy="submit-mount-points" label="Next" size="xl" :disabled="!validate()" @click="proceed" />
		<p class="mt-4 text-ls-500 text-xs">
			You can change this or add more directories later from the settings menu.
		</p>
	</div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";

import { MountDir } from "@/api/dto";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
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