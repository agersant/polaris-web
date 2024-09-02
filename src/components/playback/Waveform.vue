<template>
    <div class="relative">
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
        <canvas ref="fullWaveform" class="absolute w-full h-full" />
        <canvas ref="playedWaveform" class="absolute w-full h-full"
            :style="`clip-path: xywh(0 0 ${progress * 100}% 100%)`" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch } from 'vue';
import { useElementSize, watchDebounced } from '@vueuse/core';

import { Peaks } from '@/api/dto';
import { get_peaks } from '@/api/endpoints';

const props = defineProps<{
    path: string | undefined,
    progress: number,
}>();

const peaks: Ref<Peaks | null> = ref(null);
const loading = ref(false);

const fullWaveform: Ref<HTMLCanvasElement | null> = ref(null);
const playedWaveform: Ref<HTMLCanvasElement | null> = ref(null);
const { width, height } = useElementSize(fullWaveform);

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

watchDebounced(
    [width, height, fullWaveform, playedWaveform, peaks, loading],
    redraw,
    { debounce: 20, maxWait: 100 }
);

onMounted(redraw);

function redraw() {
    if (fullWaveform.value) {
        draw(fullWaveform.value, "#CCCCCC"); // TODO theming
    }

    if (playedWaveform.value) {
        draw(playedWaveform.value, "blue"); // TODO theming
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
    context.fillStyle = color;

    if (loading.value || !peaks.value) {
        context.fillRect(0, h / 2 - 2, w, 4);
        return;
    }

    let data = peaks.value;
    const numPeaks = Math.floor(data.length / 2);
    const read = (i: number) => data[i] / 128 - 1;
    const halfHeight = h / 2;

    if (numPeaks > w) {
        let x = 0;
        let min = 1;
        let max = -1;

        // Downsample (expected codepath)
        for (let i = 0; i < numPeaks; i++) {
            if ((x / w) < (i / numPeaks)) {
                const y = halfHeight * (1 - max);
                const height = Math.max(1, halfHeight * Math.abs(max - min));
                context.fillRect(x, y, 1, height);
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
            context.fillRect(x, y, 1, height);
        }

    }

}
</script>
