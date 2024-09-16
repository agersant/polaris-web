<template>
    <div class="w-full h-full">
        <div class="w-full h-full" draggable="true" @dragstart="onDragStart" @drag="updateDrag" @dragend="endDrag">
            <div class="w-full h-full" :class="{ 'pointer-events-none': !allowPointerEventsInside }">
                <slot />
            </div>
        </div>
        <Teleport :to="dragPreview" v-if="draggablePayload === activeDnD">
            <slot name="drag-preview" :payload="draggablePayload" />
        </Teleport>
    </div>
</template>

<script setup lang="ts" generic="T extends DnDPayload">
import { Ref, ref } from 'vue';

import { DnDPayload, useDragAndDrop } from '@/dnd';

const { allowPointerEventsInside = false, ...props } = defineProps<{
    makePayload: () => T;
    // Prevents wild jank when dragging anything that involves <img> tags
    allowPointerEventsInside?: boolean
}>();

const emits = defineEmits<{
    (event: "draggableStart", mouseEvent: DragEvent): void
}>();

const { activeDnD, startDrag, updateDrag, endDrag, dragPreview } = useDragAndDrop();

const draggablePayload: Ref<T | null> = ref(null);

function onDragStart(event: DragEvent) {
    emits("draggableStart", event);
    draggablePayload.value = props.makePayload();
    startDrag(event, draggablePayload.value);
}
</script>
