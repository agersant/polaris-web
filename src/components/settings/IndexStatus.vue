<template>
    <div class="flex flex-col">
        <SectionTitle label="Indexing Status" />
        <div class="flex justify-between items-center">

            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <div class="relative rounded-full p-1.5" :class="dotColor">
                        <div v-if="scanInProgress"
                            class="absolute inline-flex animate-ping h-3 w-3 rounded-full bg-current" />
                        <div class="h-3 w-3 rounded-full bg-current" />
                    </div>
                    <span class="font-medium text-ls-700 dark:text-ds-200" v-text="title" />
                </div>
                <div class="flex items-center gap-2 text-ls-500 dark:text-ds-400">
                    <span class="material-icons-round" v-text="'access_time'" />
                    <span v-text="timing" data-pw="last-scan" />
                </div>
                <div class="flex items-center gap-2 text-ls-500 dark:text-ds-400">
                    <span class="material-icons-round" v-text="'audiotrack'" />
                    <div class="inline-flex gap-1">
                        <span v-text="displayNumSongs" :class="scanInProgress ? 'font-mono' : ''" />
                        <span v-text="pluralize('song', displayNumSongs)" />
                    </div>
                </div>
            </div>

            <Button label="Scan Collection" icon="sync" severity="secondary" size="xl" @click="emit('trigger-index')"
                testID="trigger-scan" :disabled="status.state != 'UpToDate'" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRafFn, useTimeAgo } from "@vueuse/core";

import { IndexStatus as Status } from "@/api/dto";
import Button from "@/components/basic/Button.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
import { pluralize } from "@/format";

const props = defineProps<{ status: Status }>();

const emit = defineEmits<{
    "trigger-index": [],
}>();

const scanInProgress = computed(() => props.status.state == "InProgress");

const displayNumSongs = ref(props.status.num_songs_indexed);

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

useRafFn(({ delta }) => {
    if (props.status.state != "InProgress") {
        displayNumSongs.value = props.status.num_songs_indexed;
    } else if (displayNumSongs.value > props.status.num_songs_indexed) {
        displayNumSongs.value = 0;
    } else {
        const rate = 1 / 500;
        displayNumSongs.value = Math.floor(lerp(displayNumSongs.value, props.status.num_songs_indexed, 1 - Math.exp(-delta * rate)));
    }
})

const dotColor = computed(() => {
    switch (props.status.state) {
        case "OutOfDate": return "bg-red-500/10 text-red-500";
        case "InProgress": return "bg-yellow-400/10 text-yellow-400";
        case "UpToDate": return "bg-green-500/10 text-green-500";
    }
});

const title = computed(() => {
    switch (props.status.state) {
        case "OutOfDate": return "Out of date";
        case "InProgress": return "Scan in progress";
        case "UpToDate": return "Up to date";
    }
});

const started = useTimeAgo(() => props.status.last_start_time || Date.now(), { showSecond: true, updateInterval: 0.5 });
const end = useTimeAgo(() => props.status.last_end_time || Date.now(), { showSecond: false, updateInterval: 5 });
const timing = computed(() => {
    switch (props.status.state) {
        case "OutOfDate": return "Scan is about to start";
        case "InProgress": return `Started ${started.value}`;
        case "UpToDate": return `Scanned ${end.value}`;
    }
});
</script>
