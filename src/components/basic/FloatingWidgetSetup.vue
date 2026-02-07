<template>
    <div class="absolute h-full w-full pointer-events-none">
        <div v-show="open" class="h-full w-full pointer-events-auto" @click="dismiss" @click.right="dismiss">
            <div id="floating-widget" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, } from 'vue';
import { useEventBus } from '@vueuse/core';

export type FloatingWidgetEvent = "OPEN_WIDGET" | "CLOSE_WIDGET";

const bus = useEventBus<FloatingWidgetEvent>("floating-widget");

const open = ref(false);

bus.on((event) => {
    if (event == "OPEN_WIDGET") {
        open.value = true;
    }
    if (event == "CLOSE_WIDGET") {
        open.value = false;
    }
});

function dismiss() {
    bus.emit("CLOSE_WIDGET");
}
</script>
