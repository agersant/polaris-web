<template>
    <div class="absolute h-full w-full pointer-events-none">
        <div class="relative h-full w-full">
            <ScreenFade>
                <ScreenDarkening v-show="open" @click="close" />
            </ScreenFade>
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
import { ref } from 'vue';

import Button from "@/components/basic/Button.vue";
import ScreenDarkening from "@/components/basic/ScreenDarkening.vue";
import ScreenFade from "@/components/basic/ScreenFade.vue";

export type PanelEvent = "OPEN_PANEL" | "CLOSE_PANEL";

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
.slide-enter-active,
.slide-leave-active {
    transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>