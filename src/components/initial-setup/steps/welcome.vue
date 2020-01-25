<template>
	<div>
		<h2>Welcome to Polaris!</h2>
		<p class="explanation">Your server is up and running, let's configure a couple things.</p>
		<button data-cy="submit-welcome" class="submit" v-on:click="proceed">Sounds good</button>
	</div>
</template>

<script>
export default {
	methods: {
		proceed() {
			this.$emit("proceed");
		}
	}
};
</script>