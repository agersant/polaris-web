<template>
	<div class="flex flex-col">
		<PageTitle label="Search" />

		<div class="mb-8 flex gap-2">
			<!-- TODO clear query icon -->
			<InputText class="grow" v-model="query" id="search" name="search" placeholder="Search" icon=" search"
				autofocus="" />
			<!-- TODO Tooltip -->
			<Button icon="menu_book" label="Help" severity="tertiary" />
		</div>

		<div v-if="results?.paths.length" class="flex flex-col min-h-0">
			<SectionTitle :label="`${results.paths.length} ${pluralize('song', results.paths.length)} found`"
				class="h-10">
				<div class="flex justify-between">
					<ButtonGroup>
						<Button icon="play_arrow" severity="secondary" size="sm" @click="play" />
						<Button icon="playlist_add" severity="secondary" size="sm" @click="queue" />
					</ButtonGroup>
				</div>
				<template #right>
					<!-- TODO tooltips -->
					<Switch v-model="listMode"
						:items="[{ icon: 'compress', value: 'compact' }, { icon: 'view_list', value: 'tall' }]" />
				</template>
			</SectionTitle>
			<SongList :paths="results.paths" :compact="listMode == 'compact'" invert-stripes />
		</div>

		<div v-else-if="query.trim().length < 2" class="grow flex items-start mt-40 justify-center text-center">
			<BlankStateFiller icon="manage_search">
				Type a search query to get started.
			</BlankStateFiller>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner class="text-ls-700 dark:text-ds-400" />
		</div>

		<Error v-else-if="error">
			Something went wrong while searching for songs. Please verify the query syntax is correct.
		</Error>

		<div v-else-if="results?.paths.length == 0" class="grow flex items-start mt-40 justify-center text-center">
			<BlankStateFiller icon="search_off">
				No songs found for this query.
			</BlankStateFiller>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { refDebounced, useAsyncState } from "@vueuse/core";

import { search } from "@/api/endpoints"
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Button from "@/components/basic/Button.vue";
import ButtonGroup from "@/components/basic/ButtonGroup.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";
import Switch from "@/components/basic/Switch.vue";
import SongList from "@/components/SongList.vue";
import { pluralize } from "@/format";
import { usePlaybackStore } from "@/stores/playback";

/* TODO
syntax help
something about 1 character search terms killing queries
history persistence
dark mode
*/

const playback = usePlaybackStore();

const query = ref("");

// TODO save to preferences
const listMode = ref("compact");

const { state: rawResults, isLoading, error, execute: runQuery } = useAsyncState(
	() => {
		if (!query.value) {
			return Promise.resolve(undefined);
		}
		return search(query.value);
	},
	undefined,
	{ immediate: false, resetOnExecute: true }
);

const results = refDebounced(rawResults, 50);

watch(query, () => {
	runQuery(0);
});

function play() {
	if (!results.value) {
		return;
	}
	playback.clear();
	playback.queueTracks(results.value?.paths);
	playback.next();
}

function queue() {
	if (!results.value) {
		return;
	}
	playback.queueTracks(results.value?.paths);
}

</script>
