<template>
    <div ref="root" class="cursor-pointer relative" draggable="true" @click="seekToCursor" @dragstart="onDragStart"
        @dragend="endDrag">
        <!--
         Preferably, we would draw a single white waveform canvas. We would then
         use it as mask for two empty divs with colored backgrounds. However, this
         requires `mask-image: element(#myMaskID)` which is not well supported.
         See: 
            https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image
            https://developer.mozilla.org/en-US/docs/Web/CSS/image
            https://developer.mozilla.org/en-US/docs/Web/CSS/element
         Until then, we simply draw two distinct pre-colored canvas.
        -->
        <canvas ref="fullWaveform" class="absolute w-full h-full"
            :style="`clip-path: xywh(${progress * 100} 0 100% 100%)`" />
        <canvas ref="playedWaveform" class="absolute w-full h-full"
            :style="`clip-path: xywh(0 0 ${progress * 100}% 100%)`" />
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref, useTemplateRef, watch } from 'vue';
import { refDebounced, useCssVar, useElementSize, useMouseInElement, watchPausable, watchThrottled } from '@vueuse/core';

import { Peaks } from '@/api/dto';
import { get_peaks } from '@/api/endpoints';
import { blankElement } from '@/dnd';
import { usePreferencesStore } from '@/stores/preferences';

const preferences = usePreferencesStore();

const props = defineProps<{
    path: string | undefined,
    duration: number,
    progress: number,
}>();

const emit = defineEmits<{
    "seek": [seconds: number],
}>();

const root = useTemplateRef("root");
const fullWaveform: Ref<HTMLCanvasElement | null> = useTemplateRef("fullWaveform");
const playedWaveform: Ref<HTMLCanvasElement | null> = useTemplateRef("playedWaveform");
const { width, height } = useElementSize(fullWaveform);
const { elementX: mouseX } = useMouseInElement(root);

const peaks: Ref<Peaks | null> = ref(null);
const loading = ref(false);
const debouncedLoading = refDebounced(loading, 50);

const { pause: endDrag, resume: beginDrag } = watchPausable(mouseX, seekToCursor);

onMounted(endDrag);

function onDragStart(event: DragEvent) {
    event.dataTransfer?.setDragImage(blankElement, 0, 0);
    beginDrag();
}

function seekToCursor() {
    emit("seek", props.duration * mouseX.value / width.value);
}

watch(() => props.path, endDrag);

const playedColor = useCssVar(() => preferences.polarity == "light" ? "--accent-600" : "--accent-800", null, { observe: true });
const unplayedColor = useCssVar(() => preferences.polarity == "light" ? "--surface-300" : "--surface-700", null, { observe: true });

watch(() => props.path, async () => {
    if (props.path) {
        loading.value = true;
        try {
            peaks.value = await get_peaks(props.path);
        } catch (e) {
            peaks.value = null;
        }
        loading.value = false;
    } else {
        loading.value = false;
        peaks.value = null;
    }
}, { immediate: true });

onMounted(redraw);

watchThrottled(
    [width, height, fullWaveform, playedWaveform, peaks, debouncedLoading, playedColor, unplayedColor],
    redraw,
    { throttle: 100 },
);

function redraw() {
    if (fullWaveform.value) {
        draw(fullWaveform.value, unplayedColor.value);
    }

    if (playedWaveform.value) {
        draw(playedWaveform.value, playedColor.value);
    }
}

function draw(canvas: HTMLCanvasElement, color: string) {
    const w = width.value;
    const h = height.value;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
        return;
    }

    canvas.width = w;
    canvas.height = h;
    context.clearRect(0, 0, w, h);
    context.fillStyle = `rgb(${color})`;

    if (loading.value || !peaks.value) {
        context.fillRect(0, h / 2 - 2, w, 4);
        return;
    }

    let data = peaks.value;
    const numPeaks = Math.floor(data.length / 2);
    const read = (i: number) => data[i] / 128 - 1;
    const halfHeight = h / 2;

    context.beginPath();
    if (numPeaks > w) {
        let x = 0;
        let min = 1;
        let max = -1;

        // Downsample (expected codepath)
        for (let i = 0; i < numPeaks; i++) {
            if ((x / w) < (i / numPeaks)) {
                const y = halfHeight * (1 - max);
                const height = Math.max(1, halfHeight * Math.abs(max - min));
                context.rect(x, y, 1, height);
                min = 1;
                max = -1;
                x += 1;
            }
            min = Math.min(min, read(2 * i));
            max = Math.max(max, read(2 * i + 1));
        }

    } else {

        // Upsample (only for very short songs and/or very wide screens)
        for (let x = 0; x < w; x++) {
            const floatIndex = (x + 0.5) / w * (numPeaks - 1);
            const sampleLeft = Math.floor(floatIndex);
            const sampleRight = Math.ceil(floatIndex);
            const t = floatIndex - sampleLeft;
            const min = t * read(2 * sampleLeft) + (1 - t) * read(2 * sampleRight);
            const max = t * read(2 * sampleLeft + 1) + (1 - t) * read(2 * sampleRight + 1);
            const y = halfHeight * (1 - max);
            const height = Math.max(1, halfHeight * Math.abs(max - min));
            context.rect(x, y, 1, height);
        }

    }

    context.fill();
    context.closePath();

}
</script>
