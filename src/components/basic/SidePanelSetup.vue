<template>
    <div class="absolute h-full w-full pointer-events-none">
        <div class="relative h-full w-full">
            <Transition appear name="fade">
                <div v-show="open"
                    class="pointer-events-auto absolute h-full w-full backdrop-brightness-50 backdrop-grayscale backdrop-blur-sm"
                    @click="close" />
            </Transition>
            <Transition appear name="slide">
                <div v-show="open"
                    class="pointer-events-auto absolute right-0 h-full flex flex-col w-screen max-w-2xl bg-ls-0 dark:bg-ds-900 p-12 shadow-xl">
                    <div class="absolute right-12 top-11">
                        <Button icon="close" severity="tertiary" @click="close" />
                    </div>
                    <div ref="panelContent" id="side-panel" class="-mr-4 pr-4 overflow-y-scroll" />
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

import Button from "@/components/basic/Button.vue";

export type PanelEvent = "OPEN_PANEL" | "CLOSE_PANEL";

const panelContent = useTemplateRef("panelContent");
const open = ref(false);

const bus = useEventBus<PanelEvent>("side-panel");

bus.on((event) => {
    if (event == "OPEN_PANEL") {
        open.value = true;
    }
});

function close() {
    open.value = false;
    bus.emit("CLOSE_PANEL");
}
</script>

<style lang="css" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>