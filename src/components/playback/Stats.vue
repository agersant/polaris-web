<template>
    <div class="min-h-full flex flex-col">
        <SectionTitle label="Playlist Stats" icon="bar_chart" />
        <div class="grid grid-cols-2 gap-8 mb-8">
            <div class="p-8 border border-ls-200 rounded-lg">
                <p class="text-sm font-medium leading-6 text-ls-700">Number of songs</p>
                <p class="mt-2 flex items-baseline gap-x-2">
                    <span class="text-4xl font-semibold tracking-tight text-ls-900">9999</span>
                </p>
            </div>
            <div class="p-8 border border-ls-200 rounded-lg">
                <p class="text-sm font-medium leading-6 text-ls-700">Duration</p>
                <p class="mt-2 flex items-baseline gap-x-2">
                    <span class="text-4xl font-semibold tracking-tight text-ls-900">342.1</span>
                    <span class="text-sm text-ls-700">hours</span>
                </p>
            </div>
        </div>
        <div v-if="genreData.length > 2" class="flex flex-col">
            <SectionTitle label="Main Genres" icon="hexagon" />
            <apexchart type="radar" :options="genreChartOptions" :series="genreSeries" />
        </div>
        <div class="flex flex-col">
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

const rgb = useMode(modeRgb);
const playback = usePlaybackStore();
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

watchImmediate(playlistSongs, () => {
    let songsByGenre = new Map<string, number>();
    for (const song of playlistSongs.value) {
        for (const genre of song.genres || []) {
            songsByGenre.set(genre, 1 + (songsByGenre.get(genre) || 0));
        }
    }

    // Sort by most songs
    let genres = songsByGenre.entries().map(([genre, count]) => ({ x: genre, y: count })).toArray();
    genres.sort((a, b) => a.y - b.y).reverse();

    // Only keep top 8 and sort alphabetically
    genres = genres.filter(({ y }) => y > 0.02 && y < playlistSongs.value.length).slice(0, 8);
    genres.sort((a, b) => a.x < b.x ? 1 : -1);
    genreData.value = genres;
});


const genreSeries = computed(() => [{ data: genreData.value }]);

const accent600 = useCssVar("--accent-600");
const surface0 = useCssVar("--surface-0");
const surface50 = useCssVar("--surface-50");
const surface200 = useCssVar("--surface-200");
const surface400 = useCssVar("--surface-400");
const surface500 = useCssVar("--surface-500");
const surface700 = useCssVar("--surface-700");

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

const minYear = 2009;
const maxYear = 2025;

const yearSeries = [{
    data: [...Array(1 + maxYear - minYear).keys()].map(n => [`${minYear + n}-01-01`, Math.floor((n * 123654 + (n % 4) * n / 2) % 7)]),
}];

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
        type: 'gradient',
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
        axisBorder: { show: false },
        axisTicks: { show: false },
        min: 0,
        labels: { show: false },
    },
};

</script>