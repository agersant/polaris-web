<template>
	<div class="flex flex-col">
		<PageTitle label="Search" />

		<div class="mb-8 flex gap-2">
			<InputText class="grow" v-model="query" id="search" placeholder="Search" icon=" search" autofocus
				clearable />
			<Button icon="menu_book" label="Help" severity="tertiary" @click="showHelp = true" />
		</div>

		<div v-show="songPaths.length" class="flex flex-col min-h-0">
			<SectionTitle :label="`${songPaths.length} ${pluralize('song', songPaths.length)} found`"
				class="basis-10 shrink-0">
				<div class="flex justify-between">
					<ButtonGroup>
						<Button icon="play_arrow" severity="secondary" size="sm" @click="play" />
						<Button icon="playlist_add" severity="secondary" size="sm" @click="queue" />
					</ButtonGroup>
				</div>
				<template #right>
					<!-- TODO tooltips -->
					<Switch v-model="preferences.searchResultsDisplayMode" :items="[
						{ icon: 'compress', value: 'compact' },
						{ icon: 'view_list', value: 'tall' },
					]" />
				</template>
			</SectionTitle>
			<SongList v-model="songPaths" :compact="preferences.searchResultsDisplayMode == 'compact'" invert-stripes />
		</div>

		<div v-if="songPaths.length" />

		<div v-else-if="query.trim().length < 2" class="grow flex items-start mt-40 justify-center text-center">
			<BlankStateFiller icon="manage_search">
				Type a search query to get started.
			</BlankStateFiller>
		</div>

		<div v-else-if="isLoading" class="grow flex mt-24 items-start justify-center">
			<Spinner />
		</div>

		<Error v-else-if="error">
			Something went wrong while searching for songs. Please verify the query syntax is correct.
		</Error>

		<div v-else class="grow flex items-start mt-40 justify-center text-center">
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

				<p>Search terms containing spaces should be wrapped with quotes, for example <span
						class="font-medium text-accent-600 font-mono">"moonlight sonata"</span>.
					Spaces can also be omitted altogether for the same result (ie. <span
						class="font-medium text-accent-600 font-mono">moonlightsonata</span>).</p>

				<p>Search terms must be at least two character long. All searches are case insensitive.</p>

				<SectionTitle class="mt-4 !mb-0" label="Querying Specific Fields" icon="rule" />
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
				<p>Queries can be combined with ||, && and !! to express logical OR, AND and NOT operations. Parenthesis
					can be used to alter precedence.</p>

				<p>For example:</p>
				<ul class="ml-8 list-disc">
					<li>
						<span class="font-medium text-accent-600 font-mono">
							sonata !! moonlight
						</span>
					</li>
					<li>
						<span class="font-medium text-accent-600 font-mono">
							(composer % mozart || composer % beethoven) && sonata
						</span>
					</li>
				</ul>

				<p>Queries separated by spaces are implicitely joined by &&. For example searching for <span
						class="font-medium text-accent-600 font-mono">sonata beethoven</span> will list pieces with
					"sonata" appearing in any field and "beethoven" appearing in any field.</p>

				<SectionTitle class="mt-4 !mb-0" label="Supported Fields" icon="checklist" />
				<ul class="ml-8 list-disc">
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
			</div>
		</SidePanel>
	</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import { useAsyncState, watchPausable } from "@vueuse/core";

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
import { usePreferencesStore } from "@/stores/preferences";

const playback = usePlaybackStore();
const preferences = usePreferencesStore();

const query = ref("");

const showHelp = ref(false);

const { state: results, isLoading, error, execute: runQuery } = useAsyncState(
	async () => {
		if (!query.value) {
			return Promise.resolve(undefined);
		}
		return search(query.value).then(r => r.paths);
	},
	undefined,
	{ immediate: false, resetOnExecute: false }
);

const songPaths: Ref<string[]> = ref([]);

watch(results, () => {
	songPaths.value = results.value || [];
});

watch(error, (isError) => {
	if (isError) {
		songPaths.value = [];
	}
});

const queryWatch = watchPausable(query, (to, from) => {
	if (!results.value || !to.startsWith(from)) {
		songPaths.value = [];
	}
	runQuery(0);
});

function play() {
	if (!songPaths.value) {
		return;
	}
	playback.clear();
	playback.stop();
	playback.queueTracks(songPaths.value);
}

function queue() {
	if (!songPaths.value) {
		return;
	}
	playback.queueTracks(songPaths.value);
}

const historyStateKey = "search";

interface State {
	query: string,
}

watch(query, async () => {
	const state: State = {
		query: query.value,
	};
	history.replaceState({ ...history.state, [historyStateKey]: state }, "");
});

onMounted(() => {
	const state = history.state[historyStateKey] as State | undefined;
	if (!state) {
		return;
	}
	queryWatch.pause();
	query.value = state.query;
	nextTick(() => queryWatch.resume());
});

</script>
