<template>
	<Teleport defer to="#floating-widget">
		<div class="absolute" :style="positionStyle">
			<slot />
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, } from "vue";
import { useEventBus } from "@vueuse/core";

import { FloatingWidgetEvent } from "./FloatingWidgetSetup.vue";

const bus = useEventBus<FloatingWidgetEvent>("floating-widget");

const props = defineProps<{
	position: [number, number],
}>();

const emit = defineEmits<{
	'dismissed': [],
}>();

defineExpose({ open, close });

function open() {
	bus.emit("OPEN_WIDGET");
}

function close() {
	bus.emit("CLOSE_WIDGET");
}

bus.on((event) => {
	if (event == "CLOSE_WIDGET") {
		emit("dismissed");
	}
});

const positionStyle = computed(() => {
	return {
		left: `${props.position[0]}px`,
		top: `${props.position[1]}px`,
	};
});
</script>
