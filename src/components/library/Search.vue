<template>
	<div class="flex flex-col">
		<PageTitle label="Search" />

		<!-- TODO clear query icon -->
		<InputText class="mb-8" v-model="query" id="search" name="search" placeholder="Search" icon=" search" />
		<!-- TODO Syntax help -->

		<div v-if="results?.paths.length" class="min-h-0">
			<div v-for="song of results.paths.slice(0, 30)">
				{{ song }}
			</div>
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
import { useAsyncState } from "@vueuse/core";

import { search } from "@/api/endpoints"
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import Error from "@/components/basic/Error.vue";
import InputText from "@/components/basic/InputText.vue";
import PageTitle from "@/components/basic/PageTitle.vue";
import Spinner from "@/components/basic/Spinner.vue";

const query = ref("");

const { state: results, isLoading, error, execute: runQuery } = useAsyncState(
	() => {
		if (!query.value) {
			return Promise.resolve(undefined);
		}
		return search(query.value);
	},
	undefined,
	{ immediate: false, resetOnExecute: true }
);

watch(query, () => {
	runQuery(0);
});

</script>
