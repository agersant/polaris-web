<template>
    <div class="flex flex-col whitespace-nowrap select-none">
        <SectionTitle label="Artists" />

        <div v-if="isLoading" class="grow flex mt-24 items-start justify-center">
            <Spinner class="text-ls-700 dark:text-ds-400" />
        </div>

        <!-- TODO error state -->

        <div v-else-if="isReady && !artists.length" class="grow flex mt-40 justify-center text-center">
            <BlankStateFiller icon="person_off" suggestion="collectionSettings">
                No artists found.
            </BlankStateFiller>
        </div>

        <div v-else class="grow min-h-0 flex flex-col">

            <div class="mb-8 flex items-center justify-between">
                <div class="shrink basis-[500px] flex gap-4">
                    <Select class="grow basis-0" v-model="roleFilter" :options="roleFilters" />
                    <InputText class="grow basis-0" v-model="filter" id="filter" name="filter" placeholder="Filter"
                        icon="filter_alt" autofocus />
                </div>
                <MultiSwitch v-model="displayMode"
                    :items="[{ icon: 'view_list', value: 'fixed' }, { icon: 'text_fields', value: 'proportional' }]" />
            </div>

            <div class="grow min-h-0 overflow-y-scroll relative -mr-3 pr-3" tabindex="-1">

                <div v-if="!filtered.length" class="grow flex mt-40 justify-center text-center">
                    <BlankStateFiller icon="person_off">
                        No artists match this filter.
                    </BlankStateFiller>
                </div>

                <!-- TODO virtualize -->
                <ul class="flex flex-col divide-y divide-ls-200">
                    <li v-for="artist of filtered" class="flex items-center first:pt-1 py-4 gap-4">
                        <span
                            class="material-icons-round rounded-full flex items-center justify-center text-ls-500 bg-ls-200 p-2">person</span>
                        <div class="flex flex-col w-96">
                            <span @click="router.push(makeArtistURL(artist.name))"
                                class="cursor-pointer mb-1 font-semibold text-ls-900 text-sm overflow-hidden text-ellipsis hover:text-accent-600 hover:underline">
                                {{ artist.name || "Unknown Artist" }}
                            </span>
                            <span class="text-ls-500 text-xs">
                                {{ formatReleaseCount(artist) }}
                            </span>
                        </div>
                        <!-- TODO real genre tags -->
                        <div class="grow flex justify-end gap-2">
                            <span
                                class="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">Rock</span>
                            <span
                                class="inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700">Metal</span>
                            <span
                                class="inline-flex items-center rounded-md bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">Progressive
                                Rock</span>
                        </div>
                    </li>
                </ul>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAsyncState } from "@vueuse/core";

import { getArtists } from "@/api/endpoints";
import BlankStateFiller from "@/components/basic/BlankStateFiller.vue";
import InputText from "@/components/basic/InputText.vue";
import MultiSwitch from "@/components/basic/MultiSwitch.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import Select, { SelectOption } from "@/components/basic/Select.vue";
import Spinner from "@/components/basic/Spinner.vue";
import { ArtistHeader } from "@/api/dto";
import { makeArtistURL } from "@/router";

const router = useRouter();

const { state: artists, isLoading, isReady, error } = useAsyncState(getArtists(), []);

const filter = ref("");

// TODO add proportional mode (maybe)
const displayMode = ref("fixed");

type ArtistRole = "performer" | "composer" | "lyricist";
const roleFilters: SelectOption<ArtistRole>[] = [
    { label: "Performers", value: "performer" },
    { label: "Composers", value: "composer" },
    { label: "Lyricists", value: "lyricist" },
];
const roleFilter = ref(roleFilters[0]);

// TODO scroll to top when filter, roleFilter or displayMode changes

const filtered = computed(() => {
    const query = filter.value.toLowerCase();
    const role = roleFilter.value.value;
    return artists.value.filter(a => {
        switch (role) {
            case "performer":
                if (a.num_albums_as_performer <= 0 && a.num_albums_as_additional_performer < 2) {
                    return false;
                }
                break;
            case "composer":
                if (a.num_albums_as_composer < 1) {
                    return false;
                }
                break;
            case "lyricist":
                if (a.num_albums_as_lyricist < 1) {
                    return false;
                }
                break;
        }
        if (!filter.value.length) {
            return true;
        }
        return a.name.toLowerCase().includes(query);
    });
});

function formatReleaseCount(artist: ArtistHeader) {
    const plural = (n: number) => n > 1 ? "s" : "";
    const role = roleFilter.value.value;
    switch (role) {
        case "performer":
            {
                const albums = artist.num_albums_as_performer;
                const appearances = artist.num_albums_as_additional_performer;
                if (albums && appearances) {
                    return `${albums} release${plural(albums)}, ${appearances} other appearance${plural(appearances)}`;
                } else if (appearances) {
                    return `${appearances} appearance${plural(appearances)}`;
                } else {
                    return `${albums} release${plural(albums)}`;
                }
            }
        case "composer":
            {
                const albums = artist.num_albums_as_composer;
                return `${albums} release${plural(albums)}`;
            }
        case "lyricist":
            {
                const albums = artist.num_albums_as_lyricist;
                return `${albums} release${plural(albums)}`;
            }
    }

}
</script>
