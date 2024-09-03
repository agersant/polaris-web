<template>
    <div ref="root" @click="snapToCursor" @keydown="onKeyDown" @dragstart="onDragStart" @dragend="endDrag"
        draggable="true" tabindex="-1"
        class="cursor-pointer group relative h-1.5 rounded-full bg-ls-300 dark:bg-ds-700">
        <div class="absolute h-full rounded-full bg-accent-600 dark:bg-accent-700" :style="`width: ${100 * model}%`" />
        <div class="cursor-grab
        absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5
        rounded-full shadow-sm border-2
        bg-ls-0 dark:bg-ds-900 
        border-ls-300 dark:border-ds-700
        group-active:border-accent-500 group-focus:border-accent-500
        dark:group-active:border-accent-600 dark:group-focus:border-accent-600" :style="`left: ${100 * model}%`" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, } from 'vue';
import { useMouseInElement, watchPausable } from '@vueuse/core';

import { blankElement } from '@/dnd';

const model = defineModel<number>({ required: true });

const root: Ref<HTMLElement | null> = ref(null);

const { elementX: mouseX, elementWidth: width } = useMouseInElement(root);

const { pause: endDrag, resume: beginDrag } = watchPausable(mouseX, snapToCursor);

onMounted(endDrag);

function onDragStart(event: DragEvent) {
    event.dataTransfer?.setDragImage(blankElement, 0, 0);
    beginDrag();
}

function onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
        case 'ArrowLeft':
            model.value = Math.max(0, Math.min(model.value - 0.02, 1));
            break;
        case 'ArrowRight':
            model.value = Math.max(0, Math.min(model.value + 0.02, 1));
            break;
    }
}

function snapToCursor() {
    model.value = Math.max(0, Math.min(mouseX.value / width.value, 1));
    root.value?.focus();
}
</script>
