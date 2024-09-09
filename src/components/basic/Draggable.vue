<template>
    <div class="w-full h-full">
        <div class="w-full h-full" draggable="true" @dragstart="onDragStart" @drag="updateDrag" @dragend="endDrag">
            <!-- Prevents wild jank when dragging anything that involves <img> tags -->
            <div class="w-full h-full pointer-events-none">
                <slot />
            </div>
        </div>
        <Teleport :to="dragPreview" v-if="draggablePayload == activeDnD">
            <slot name="drag-preview" />
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue';

import { DnDPayload, useDragAndDrop } from '@/dnd';

const props = defineProps<{
    makePayload: () => DnDPayload;
}>();

const { activeDnD, startDrag, updateDrag, endDrag, dragPreview } = useDragAndDrop();

const draggablePayload: Ref<DnDPayload | null> = ref(null);

function onDragStart(event: DragEvent) {
    draggablePayload.value = props.makePayload();
    startDrag(event, draggablePayload.value);
}
</script>
