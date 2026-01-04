<template>
	<div class="grow overflow-y-auto -mx-4 px-4">
		<div v-if="!settings || !mountDirs.fetchedInitialState || !indexStatus"
			class="grow flex mt-24 items-start justify-center">
			<Spinner />
		</div>

		<div v-else class="flex flex-col gap-8">
			<Section>
				<SectionTitle label="Indexing Status" />
				<IndexStatus :status="indexStatus" @trigger-index="onTriggerIndex" />
			</Section>

			<Section>
				<SectionTitle label="Music Sources" />
				<div class="flex flex-col gap-8">
					<div class="flex flex-col gap-4">
						<div class="flex gap-4 w-3/4" v-for="(mountDir, index) in mountDirs.listing">
							<InputText v-model="mountDir.name" id="name" :label="index ? '' : 'Name'"
								icon="library_music" placeholder="My Music" data-pw="name" class="grow" />
							<InputText v-model="mountDir.source" id="source" :label="index ? '' : 'Location'"
								icon="folder" placeholder="/home/music" data-pw="location" class="grow" />
							<Button icon="delete" severity="tertiary" data-pw="delete-source" class="self-end mb-0.5"
								@click="mountDirs.remove(mountDir)" />
						</div>
						<Button label="Add Source" icon="add" severity="tertiary" data-pw="add-source"
							class="self-start" @click="mountDirs.create" />
					</div>
					<!-- TODO Tooltip -->
					<InputText id="album-art" v-model="settings.album_art_pattern" label="Album Art Pattern"
						icon="image_search" placeholder="Folder.(jpg|png)" :error="albumArtPatternError" class="w-72" />
					<Button label="Apply Changes" icon="check" size="xl" class="self-end w-40" @click="apply"
						data-pw="apply" />
				</div>
			</Section>
		</div>

	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, Ref, ref } from "vue";
import { useTimeoutPoll } from "@vueuse/core";

import { IndexStatus as IndexStatusDTO, Settings } from "@/api/dto";
import { getIndexStatus, getSettings, putSettings, triggerIndex } from "@/api/endpoints";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import Section from "@/components/basic/Section.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import IndexStatus from "@/components/settings/IndexStatus.vue";
import { useMountDirsStore } from "@/stores/mount-dirs";

const mountDirs = useMountDirsStore();

const settings: Ref<Settings | undefined> = ref(undefined);
const indexStatus: Ref<IndexStatusDTO | undefined> = ref(undefined);

onMounted(async () => {
	settings.value = await getSettings();
	mountDirs.refresh();
});

async function fetchIndexState() {
	indexStatus.value = await getIndexStatus();
}

useTimeoutPoll(fetchIndexState, 1000, { immediate: true })

const albumArtPatternError = computed(() => {
	try {
		if (settings.value?.album_art_pattern.length) {
			new RegExp(settings.value.album_art_pattern);
		}
		return false;
	} catch (e) {
		return true;
	}
});

async function onTriggerIndex() {
	await triggerIndex();
	await fetchIndexState();
}

async function apply() {
	await mountDirs.save();
	putSettings({
		album_art_pattern: settings.value?.album_art_pattern,
	});
}
</script>
