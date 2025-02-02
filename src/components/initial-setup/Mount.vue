<template>
	<Step title="Music Sources"
		description="Please indicate which directory Polaris should scan to populate your music collection.">
		<form @submit.prevent="proceed" class="flex flex-col gap-4">
			<div class="flex items-stretch gap-6">
				<InputText class="grow" v-model="mountDir.source" id="location" label="Location"
					placeholder="C:\MyMusic" required />
				<InputText class="grow" v-model="mountDir.name" id="name" label="Name" placeholder="Local Drive Music"
					required />
			</div>
			<Button type="submit" label="Next" size="xl" :disabled="!validate()" data-pw="submit-mount-dirs" />
			<p class="mt-4 text-ls-500 text-xs">
				You can change this or add more directories later from the settings menu.
			</p>
		</form>
	</Step>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";

import { MountDir } from "@/api/dto";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import Step from "@/components/initial-setup/Step.vue";
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
