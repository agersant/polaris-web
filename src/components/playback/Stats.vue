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
        <div class="flex flex-col">
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
import { computed } from 'vue';
import { useCssVar } from '@vueuse/core';

import SectionTitle from '@/components/basic/SectionTitle.vue';

const rgb = useMode(modeRgb);

defineProps<{
    paths: string[]
}>();

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

const genreSeries = [{
    data: [80, 50, 30, 40, 100, 20],
}];

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
        curve: "straight",
        width: 1.5,
    },
    tooltip: { enabled: false },
    xaxis: {
        categories: ['Metal', 'Heavy Metal', 'Black Metal', 'Power Metal', 'Symphonic Metal', 'Folk Metal'],
        labels: {
            style: {
                colors: [toHex(surface700.value), toHex(surface700.value), toHex(surface700.value), toHex(surface700.value), toHex(surface700.value), toHex(surface700.value)],
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
    },
    yaxis: { labels: { style: { colors: "#00000000" } } }, // Draw transparent. Disabling these entirely misaligns the chart.
}));

const minYear = 2012;
const maxYear = 2025;

const yearSeries = [{
    data: [...Array(1 + maxYear - minYear).keys()].map(n => [minYear + n, Math.floor((n * 165654 + n * n / 2) % 7)]),
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
        axisBorder: { show: false },
        axisTicks: {
            color: toHex(surface400.value),
        },
        decimalsInFloat: 0,
        labels: {
            offsetY: 8,
            rotateAlways: true,
            style: {
                colors: toHex(surface500.value),
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
        type: "numeric",
    },
    yaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        min: 0,
        labels: { show: false },
    },
};

</script>