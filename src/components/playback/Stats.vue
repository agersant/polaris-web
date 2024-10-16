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
            <SectionTitle label="Main Genres" icon="label" />
            <apexchart type="radar" :options="genreChartOptions" :series="genreSeries" />
        </div>
        <div class="flex flex-col">
            <SectionTitle label="Songs by Year" icon="timeline" />
            <apexchart type="area" :options="yearChartOptions" :series="yearSeries" />
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

const accentColor = useCssVar("--accent-600");
const backgroundColor = useCssVar("--surface-0");
const dimmestColor = useCssVar("--surface-50");
const dimColor = useCssVar("--surface-200");
const dimTextColor = useCssVar("--surface-500");
const textColor = useCssVar("--surface-700");

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
    colors: [toHex(accentColor.value)],
    markers: { size: 5, shape: "diamond", strokeOpacity: 0, },
    plotOptions: {
        radar: {
            size: 130,
            polygons: {
                strokeColors: toHex(dimColor.value),
                fill: {
                    colors: [toHex(dimmestColor.value), toHex(backgroundColor.value)]
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
                colors: [toHex(textColor.value), toHex(textColor.value), toHex(textColor.value), toHex(textColor.value), toHex(textColor.value), toHex(textColor.value)],
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
    },
    yaxis: { show: false },
}));

const yearSeries = [{
    data: [[1990, 21], [1991, 65], [1992, 38], [1993, 94], [1998, 2], [2001, 6], [2002, 13], [2005, 17], [2012, 8], [2020, 2]],
}];

const yearChartOptions = {
    chart: {
        animations: { enabled: false },
        redrawOnParentResize: true,
        toolbar: { show: false },
        zoom: { enabled: false },
    },
    colors: [toHex(accentColor.value)],
    dataLabels: { enabled: false },
    grid: {
        borderColor: toHex(dimColor.value),
    },
    markers: { size: 5, shape: "diamond", strokeOpacity: 0, },
    stroke: {
        curve: "straight",
        width: 1.5,
    },
    tooltip: { enabled: false },
    xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
            offsetY: 8,
            rotateAlways: true,
            style: {
                colors: toHex(dimTextColor.value),
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
    },
    yaxis: {
        labels: {
            offsetX: -16,
            style: {
                colors: toHex(dimTextColor.value),
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "InterVariable",
            },
        },
    },
};

</script>