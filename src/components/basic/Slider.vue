<template>
    <div>
        <div v-if="label" class="block mb-2 text-sm font-medium leading-6 text-ls-900 dark:text-ds-0">
            {{ label }}
        </div>
        <div ref="root" @click="snapToCursor" @keydown="onKeyDown" tabindex="-1"
            class="cursor-pointer group relative h-1.5 rounded-full bg-ls-300 dark:bg-ds-700">
            <div class="absolute h-full rounded-full bg-accent-600 dark:bg-accent-700"
                :style="`width: ${100 * unscale(model)}%`" />
            <div class="cursor-grab
            absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5
            rounded-full shadow-sm border-2
            bg-ls-0 dark:bg-ds-900 
            border-ls-300 dark:border-ds-700
            group-active:border-accent-500 group-focus:border-accent-500
            dark:group-active:border-accent-600 dark:group-focus:border-accent-600"
                :style="`left: ${100 * unscale(model)}%`" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef, watch, } from 'vue';
import { useMouseInElement, useMousePressed, watchPausable } from '@vueuse/core';

const model = defineModel<number>({ required: true });

const { min = 0, max = 1 } = defineProps<{
    min?: number,
    max?: number
    label?: string,
}>();

const root = useTemplateRef("root");

const { elementX: mouseX, elementWidth: width } = useMouseInElement(root);
const { pressed } = useMousePressed({ target: root })
const { pause: endDrag, resume: beginDrag } = watchPausable(mouseX, snapToCursor);

onMounted(endDrag);

watch(pressed, (down) => {
    if (down) {
        beginDrag();
    } else {
        endDrag();
    }
});

function scale(value: number) {
    return min + (max - min) * Math.max(0, Math.min(value, 1));
}

function unscale(value: number) {
    return (value - min) / (max - min);
}

function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
        case 'ArrowLeft':
            model.value = scale(unscale(model.value) - 0.02);
            break;
        case 'ArrowRight':
            model.value = scale(unscale(model.value) + 0.02);
            break;
    }
}

function snapToCursor() {
    model.value = scale(mouseX.value / width.value);
    root.value?.focus();
}
</script>
