<template>
	<button @click="event => emits('click', event)" v-bind:disabled="disabled || state.disabled"
		v-bind:type="submit ? 'submit' : 'button'"
		v-bind:class="{ submit: submit, success: state.success, failure: state.failure }">
		<div class="status">
			<span v-for="possibleState in states" v-bind:key="possibleState.name" v-bind:class="{
				'tick-in': possibleState == state && canAnimate,
				'tick-out': possibleState == previousState && canAnimate,
				'snap-out': possibleState != state && possibleState != previousState
			}">{{ possibleState.name }}</span>
		</div>
	</button>
</template>

<script setup lang="ts">
import { Ref, ref, watch } from "vue";

export type State = {
	name: string,
	disabled?: boolean,
	success?: boolean,
	failure?: boolean,
}

const props = defineProps<{
	states: Record<string, State>,
	state: State,
	submit?: boolean,
	disabled?: boolean,
}>();

const emits = defineEmits<{
	(event: "click", mouseEvent: MouseEvent): void
}>();

const canAnimate = ref(false);
const previousState: Ref<State | null> = ref(null);

watch(() => props.state, (to, from) => {
	previousState.value = from;
	canAnimate.value = from != null;
});
</script>

<style scoped>
button {
	width: 95px;
	height: 32px;
	padding-left: 0;
	padding-right: 0;
}

button.success {
	transition: all 250ms ease-in-out;
	background-color: var(--theme-good);
	border: 0;
}

button.failure {
	transition: all 250ms ease-in-out;
	background-color: var(--theme-bad);
	border: 0;
}

button.success * {
	color: var(--theme-foreground-against-good);
}

button.failure * {
	color: var(--theme-foreground-against-bad);
}

.status {
	text-align: center;
	height: 100%;
	width: 100%;
	position: relative;
	overflow: hidden;
}

.status span {
	position: absolute;
	left: 0;
	right: 0;
	margin: auto;
}

.tick-in {
	animation: in 250ms ease-in-out;
	animation-fill-mode: forwards;
}

.tick-out {
	animation: out 250ms ease-in-out;
	animation-fill-mode: forwards;
}

.snap-out {
	animation: out 0ms;
	animation-fill-mode: forwards;
}

@keyframes in {
	from {
		top: 40px;
	}

	to {
		top: 0px;
	}
}

@keyframes out {
	from {
		top: 0px;
	}

	to {
		top: -40px;
	}
}
</style>