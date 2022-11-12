<template>
	<div ref="container" class="container">
		<img ref="image" v-bind:src="props.url" />
	</div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, Ref, ref } from "vue";

const props = defineProps<{
	url: string,
}>();

const container: Ref<HTMLElement | null> = ref(null);
const image: Ref<HTMLImageElement | null> = ref(null);

onMounted(()=> {
	if (!image.value) {
		return;
	}
	window.addEventListener("resize", resize);
	image.value.addEventListener("load", resize);
	resize();
});

onBeforeUnmount(() => {
	window.removeEventListener("resize", resize);
	if (image.value) {
		image.value.removeEventListener("load", resize);
	}
});

function resize() {
	if (!image.value || !container.value) {
		return;
	}

	let sourceWidth = image.value.naturalWidth;
	let sourceHeight = image.value.naturalHeight;
	if (sourceWidth == 0 || sourceHeight == 0) {
		return;
	}

	let availableWidth = container.value.offsetWidth;
	let availableHeight = container.value.offsetHeight;
	if (availableWidth == 0 || availableHeight == 0) {
		return;
	}

	let sourceAspectRatio = sourceWidth / sourceHeight;
	let availableAspectRatio = availableWidth / availableHeight;

	let width, height;
	if (availableAspectRatio > sourceAspectRatio) {
		width = sourceWidth * (availableHeight / sourceHeight);
		height = availableHeight;
	} else {
		width = availableWidth;
		height = sourceHeight * (availableWidth / sourceWidth);
	}

	image.value.style.setProperty("visibility", "initial");
	image.value.style.setProperty("width", width + "px");
	image.value.style.setProperty("height", height + "px");
}
</script>

<style scoped>
.container {
	position: absolute;
	width: 100%;
	height: 100%;

	display: flex;
	align-items: center;
	justify-content: center;
}

img {
	visibility: hidden;
	border-radius: 5px;
}
</style>