<template>
	<button
		v-on:click="event => $emit('click', event)"
		v-bind:disabled="disabled || state.disabled"
		v-bind:type="submit ? 'submit' : 'button'"
		v-bind:class="{ submit: submit, success: state.success, failure: state.failure }"
	>
		<div class="status">
			<span
				v-for="(possibleState, index) in states"
				v-bind:key="index"
				v-bind:class="{
					'tick-in': possibleState == state && canAnimate,
					'tick-out': possibleState == previousState && canAnimate,
					'snap-out': possibleState != state && possibleState != previousState
				}"
			>{{ possibleState.name }}</span>
		</div>
	</button>
</template>

<script>
export default {
	props: {
		submit: {
			type: Boolean,
			required: true,
		},
		states: {
			type: Object,
			required: true,
		},
		state: {
			type: Object,
			default: function () {
				return {};
			},
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},

	emits: ['click'],

	data() {
		return {
			canAnimate: false,
			previousState: null,
		};
	},

	watch: {
		state: function (to, from) {
			this.previousState = from;
			this.canAnimate = from != null;
		},
	},
};
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