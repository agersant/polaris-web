<template>
    <div class="min-h-full flex flex-col">
        <SectionTitle label="Playlist Stats" icon="bar_chart" />
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="p-8 border border-ls-200 rounded-lg">
                <p class="text-sm font-medium leading-6 text-ls-700 dark:text-ds-200">Number of songs</p>
                <p class="mt-2 flex items-baseline gap-x-2">
                    <span class="text-4xl font-semibold tracking-tight text-ls-900 dark:text-ds-0"
                        v-text="playback.playlist.length" />
                </p>
            </div>
            <div class="p-8 border border-ls-200 rounded-lg">
                <p class="text-sm font-medium leading-6 text-ls-700 dark:text-ds-200">Duration</p>
                <p class="mt-2 flex items-baseline gap-x-2">
                    <span class="text-4xl font-semibold tracking-tight text-ls-900 dark:text-ds-0" v-text="duration" />
                    <span class="text-sm text-ls-700 dark:text-ds-200" v-text="durationUnit" />
                </p>
            </div>
        </div>
        <div v-if="genreData.length > 2" class="flex flex-col">
            <SectionTitle label="Main Genres" icon="hexagon" />
            <apexchart type="radar" :options="genreChartOptions" :series="genreSeries" />
        </div>
        <div v-if="yearData.length > 1" class="flex flex-col">
            <SectionTitle label="Songs by Year" icon="timeline" />
            <apexchart type="line" :options="yearChartOptions" :series="yearSeries" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatHex, modeRgb, useMode } from 'culori';
import { computed, Ref, ref } from 'vue';
import { useCssVar, watchImmediate } from '@vueuse/core';

import { Song } from '@/api/dto';
import SectionTitle from '@/components/basic/SectionTitle.vue';
import { usePlaybackStore } from '@/stores/playback';
import { useSongsStore } from '@/stores/songs';
import { usePreferencesStore } from '@/stores/preferences';

const rgb = useMode(modeRgb);
const playback = usePlaybackStore();
const preferences = usePreferencesStore();
const songs = useSongsStore();

const playlistSongs = computed(() => {
    let out: Song[] = [];
    return playback.playlist.reduce(function (r, entry) {
        const song = songs.cache.get(entry.path);
        if (song) {
            r.push(song);
        }
        return r;
    }, out);
});

const genreData: Ref<{ x: string, y: number }[]> = ref([]);
const yearData: Ref<[string, number][]> = ref([]);
const duration = ref(0);
const durationUnit = ref("");

watchImmediate(playlistSongs, () => {
    let songsByGenre = new Map<string, number>();
    let songsByYear = new Map<number, number>();
    let seconds = 0;

    for (const song of playlistSongs.value) {
        for (const genre of song.genres || []) {
            songsByGenre.set(genre, 1 + (songsByGenre.get(genre) || 0));
        }
        if (song.year) {
            songsByYear.set(song.year, 1 + (songsByYear.get(song.year) || 0));
        }
        seconds += song.duration || 0;
    }

    {
        // Sort genres by most songs
        let genres = Array.from(songsByGenre, ([genre, count]) => ({ x: genre, y: Math.pow(count, 0.4) }));
        genres.sort((a, b) => a.y - b.y).reverse();

        // Only keep top 8 and sort alphabetically
        genres = genres.slice(0, 8);
        genres.sort((a, b) => a.x < b.x ? -1 : 1);
        genreData.value = genres;
    }

    {
        let minYear = 9999;
        let maxYear = 0;
        for (let [year, _] of songsByYear.entries()) {
            minYear = Math.min(year, minYear);
            maxYear = Math.max(year, maxYear);
        }
        let years: [string, number][] = [];
        for (let y = minYear; y <= maxYear; y++) {
            years.push([`${y}-01-01`, songsByYear.get(y) || 0]);
        }
        yearData.value = years;
    }

    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    if (hours < 2) {
        duration.value = Math.floor(seconds / 60);
        durationUnit.value = "mins";
    } else if (days < 2) {
        duration.value = Math.floor(10 * hours) / 10;
        durationUnit.value = "hours";
    } else {
        duration.value = Math.floor(10 * days) / 10;
        durationUnit.value = "days";
    }
});

const genreSeries = computed(() => [{ data: genreData.value }]);
const yearSeries = computed(() => [{ data: yearData.value }]);

const lightMode = computed(() => preferences.polarity == "light");
const accent600 = useCssVar(() => lightMode.value ? "--accent-600" : "--accent-700");
const surface0 = useCssVar(() => lightMode.value ? "--surface-0" : "--surface-900");
const surface50 = useCssVar(() => lightMode.value ? "--surface-50" : "--surface-800");
const surface200 = useCssVar(() => lightMode.value ? "--surface-200" : "--surface-700");
const surface400 = useCssVar(() => lightMode.value ? "--surface-400" : "--surface-600");
const surface500 = useCssVar("--surface-500");
const surface700 = useCssVar(() => lightMode.value ? "--surface-700" : "--surface-300");

function toHex(color: string) {
    return formatHex(rgb(`rgb(${color})`));
}

const genreChartOptions = computed(() => ({
    chart: {
        animations: { enabled: false },
        redrawOnParentResize: true,
        toolbar: { show: false },
        zoom: { enabled: false },
    },
    colors: [toHex(accent600.value)],
    markers: { size: 5, shape: "diamond", strokeOpacity: 0, },
    plotOptions: {
        radar: {
            size: 130,
            polygons: {
                strokeColors: toHex(surface200.value),
                fill: {
                    colors: [toHex(surface50.value), toHex(surface0.value)]
                }
            }
        }
    },
    stroke: {
        width: 1.5,
    },
    tooltip: { enabled: false },
    xaxis: {
        labels: {
            style: {
                colors: genreData.value.map(_ => toHex(surface700.value)),
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
    },
    yaxis: {
        // Draw transparent. Disabling these entirely misaligns the chart.
        labels: { style: { colors: "#00000000" } },
    },
}));


const yearChartOptions = {
    chart: {
        animations: { enabled: false },
        redrawOnParentResize: true,
        toolbar: { show: false },
        zoom: { enabled: false },
    },
    colors: [toHex(accent600.value)],
    dataLabels: { enabled: false },
    grid: { show: false, },
    fill: {
        type: "gradient",
        gradient: {
            type: "vertical",
            colorStops: [
                { offset: 0, color: toHex(accent600.value), opacity: 1 },
                { offset: 100, color: toHex(accent600.value), opacity: 0.2 },
            ]
        }
    },
    stroke: { curve: "smooth" },
    tooltip: { enabled: false },
    xaxis: {
        axisBorder: { color: toHex(surface200.value) },
        axisTicks: {
            color: toHex(surface400.value),
        },
        decimalsInFloat: 0,
        labels: {
            rotateAlways: true,
            style: {
                colors: toHex(surface500.value),
                fontSize: "12px",
                fontFamily: "InterVariable",
            },
        },
        type: "datetime",
    },
    yaxis: {
        axisBorder: { show: true },
        axisTicks: {
            show: true,
            color: toHex(surface400.value),
        },
        tickAmount: 4,
        labels: {
            style: {
                colors: toHex(surface500.value),
                fontSize: "12px",
                fontFamily: "InterVariable",
            },
        },
    },
};

</script>