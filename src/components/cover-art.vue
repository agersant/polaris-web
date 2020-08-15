<template>
	<div ref="container" class="container">
		<img ref="image" v-bind:src="url" />
	</div>
</template>

<script>
import Vue from "vue";
export default {
	props: {
		url: {
			type: String,
			required: true,
		},
	},

	data() {
		return {};
	},

	mounted() {
		this.resizeHandler = window.addEventListener("resize", this.resize);
		this.loadHandler = this.$refs.image.addEventListener("load", this.resize);
		this.resize();
	},

	unmounted() {
		if (this.resizeHandler) {
			window.removeEventListener(this.resizeHandler);
			this.resizeHandler = null;
		}
		if (this.loadHandler && this.$refs.image) {
			this.$refs.image.removeEventListener(this.loadHandler);
			this.loadHandler = null;
		}
	},

	methods: {
		resize() {
			if (!this.$refs.image) {
				return;
			}

			let sourceWidth = this.$refs.image.naturalWidth;
			let sourceHeight = this.$refs.image.naturalHeight;
			if (sourceWidth == 0 || sourceHeight == 0) {
				return;
			}

			let availableWidth = this.$refs.container.offsetWidth;
			let availableHeight = this.$refs.container.offsetHeight;
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

			this.$refs.image.style.setProperty("visibility", "initial");
			this.$refs.image.style.setProperty("width", width + "px");
			this.$refs.image.style.setProperty("height", height + "px");
		},
	},
};
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