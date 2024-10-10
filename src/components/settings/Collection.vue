<template>
	<div class="flex flex-col gap-8">

		<div class="flex flex-col rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
			<SectionTitle label="Indexing Status" />
			<div class="flex justify-between items-center">
				<div class="flex flex-col gap-3">
					<div class="flex items-center gap-2">
						<div class="flex-none rounded-full bg-green-400/10 p-1.5">
							<div class="h-3 w-3 rounded-full bg-green-400" />
						</div>
						<span class="font-medium text-ls-700 dark:text-ds-200">Up to date</span>
					</div>
					<div class="flex items-center gap-2 text-ls-500 dark:text-ds-400">
						<span class="material-icons-round" v-text="'access_time'" />
						<span>Scanned 2 minutes ago</span>
					</div>
					<div class="flex items-center gap-2 text-ls-500 dark:text-ds-400">
						<span class="material-icons-round" v-text="'audiotrack'" />
						<span>43900 songs</span>
					</div>
				</div>
				<Button label="Scan Collection" icon="sync" severity="secondary" size="xl" @click="triggerIndex" />
			</div>
		</div>

		<div class="flex flex-col rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
			<SectionTitle label="Music Sources" />
			<div class="flex flex-col gap-8">
				<div class="flex flex-col gap-4">
					<div class="flex gap-4 w-3/4" v-for="(mountDir, index) in mountDirs.listing">
						<InputText v-model="mountDir.name" id="name" :label="index ? '' : 'Name'" icon="library_music"
							placeholder="My Music" class="grow" />
						<InputText v-model="mountDir.source" id="source" :label="index ? '' : 'Location'" icon="folder"
							placeholder="/home/music" class="grow" />
						<Button icon="delete" severity="tertiary" class="self-end mb-0.5"
							@click="mountDirs.remove(mountDir)" />
					</div>
					<Button label="Add Source" icon="add" severity="tertiary" class="self-start"
						@click="mountDirs.create" />
				</div>
				<!-- TODO Tooltip -->
				<InputText id="album-art" label="Album Art Pattern" icon="image_search" class="w-72"
					placeholder="Folder.(jpg|png)" />
				<Button label="Apply Changes" icon="check" size="xl" class="self-end w-40" @click="apply" />
			</div>
		</div>

	</div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";

import { Settings } from "@/api/dto";
import { getSettings, putSettings, triggerIndex } from "@/api/endpoints";
import { useMountDirsStore } from "@/stores/mount-dirs";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";

const mountDirs = useMountDirsStore();

const settings: Ref<Settings | null> = ref(null);

onMounted(async () => {
	settings.value = await getSettings();
	mountDirs.refresh();
});

function validateAlbumArtPattern() {
	try {
		if (settings.value) {
			new RegExp(settings.value.album_art_pattern);
		}
		return true;
	} catch (e) {
		return false;
	}
}

async function apply() {
	await mountDirs.save();
	putSettings(settings.value);
}
</script>
