<template>
	<div class="flex flex-col">
		<PageTitle label="Search" />

		<div class="mb-8 flex gap-2">
			<InputText class="grow" v-model="query" id="search" name="search" placeholder="Search" icon=" search"
				autofocus clearable />
			<Button icon="menu_book" label="Help" severity="tertiary" @click="showHelp = true" />
		</div>

		<div v-if="results?.paths.length" class="flex flex-col min-h-0">
			<SectionTitle :label="`${results.paths.length} ${pluralize('song', results.paths.length)} found`"
				class="basis-10 shrink-0">
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

		<SidePanel v-model="showHelp">
			<div class="flex flex-col gap-4 text-ls-900 dark:text-ds-200 text-sm">
				<div class="text-2xl font-semibold leading-6 text-ls-700 dark:text-ds-200 mb-8">Search Syntax</div>

				<SectionTitle class="!mb-0" label="Querying Any Field" icon="auto_awesome" />

				<p>Searching for <span class="font-medium text-accent-600 font-mono">sonata</span> will find any song
					with "sonata" in its title, artist, file path, album name etc.</p>

				<p>Search terms containing spaces should be wrapped with quotes, fpr example <span
						class="font-medium text-accent-600 font-mono">"moonlight sonata"</span>.
					Spaces can also be omitted altogether for the same result (ie. <span
						class="font-medium text-accent-600 font-mono">moonlightsonata</span>).</p>

				<p>All searches are case insensitive.</p>

				<SectionTitle class="mt-4 !mb-0" label="Querying Specific Fields" icon="rule" />
				<p>The supported fields are:
				<ul class="ml-8 mt-2 list-disc">
					<li><span class="font-medium text-accent-600 font-mono">album</span></li>
					<li><span class="font-medium text-accent-600 font-mono">albumartist</span></li>
					<li><span class="font-medium text-accent-600 font-mono">artist</span></li>
					<li><span class="font-medium text-accent-600 font-mono">composer</span></li>
					<li><span class="font-medium text-accent-600 font-mono">discnumber</span></li>
					<li><span class="font-medium text-accent-600 font-mono">genre</span></li>
					<li><span class="font-medium text-accent-600 font-mono">label</span></li>
					<li><span class="font-medium text-accent-600 font-mono">lyricist</span></li>
					<li><span class="font-medium text-accent-600 font-mono">path</span></li>
					<li><span class="font-medium text-accent-600 font-mono">title</span></li>
					<li><span class="font-medium text-accent-600 font-mono">tracknumber</span></li>
					<li><span class="font-medium text-accent-600 font-mono">year</span></li>
				</ul>
				</p>
				<p>Partial matches for text fields can be expressed with the % operator. For example, <span
						class="font-medium text-accent-600 font-mono">composer % bac</span> would returns pieces with
					J.S.
					Bach or Jacques Offenbach as their composer.</p>
				<p>Exact matches can be expressed with the = operator. For example, <span
						class="font-medium text-accent-600 font-mono">genre = metal</span> would return songs that have
					a "Metal"
					tag, but not those with only a "Doom Metal" tag.</p>
				<p>For number fields (track number, disc number, year), comparisons using
					<span class="font-medium text-accent-600 font-mono">&lt;</span>,
					<span class="font-medium text-accent-600 font-mono">&lt;=</span>,
					<span class="font-medium text-accent-600 font-mono">&gt;</span> and
					<span class="font-medium text-accent-600 font-mono">&gt;= </span>
					are also supported.
				</p>

				<SectionTitle class="mt-4 !mb-0" label="Combining Queries" icon="join_left" />
				<p>Queries can be combined with || and && to express logical OR and AND operations. Parenthesis can be
					used to alter precedence. For example, <span class="font-medium text-accent-600 font-mono">
						(composer % mozart || composer % beethoven) && sonata</span>.
				</p>
				<p>Queries separated by spaces are implicitely joined by &&. For example searching for <span
						class="font-medium text-accent-600 font-mono">sonata beethoven</span> will list pieces with
					"sonata" appearing in any field and "beethoven" appearing in any field.</p>
			</div>
		</SidePanel>
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
import SidePanel from "@/components/basic/SidePanel.vue";
import Spinner from "@/components/basic/Spinner.vue";
import Switch from "@/components/basic/Switch.vue";
import SongList from "@/components/SongList.vue";
import { pluralize } from "@/format";
import { usePlaybackStore } from "@/stores/playback";

/* TODO
history persistence
*/

const playback = usePlaybackStore();

const query = ref("");

// TODO save to preferences
const listMode = ref("compact");

const showHelp = ref(false);

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
