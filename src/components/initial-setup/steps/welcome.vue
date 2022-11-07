<template>
	<div>
		<h2>Welcome to Polaris!</h2>
		<p class="explanation">Your server is up and running, let's configure a couple things.</p>
		<button data-cy="submit-welcome" class="submit" @click="emits('proceed')">Sounds good</button>
	</div>
</template>

<script setup lang="ts">

const emits = defineEmits<{
	(event: "proceed"): void
}>();

</script>