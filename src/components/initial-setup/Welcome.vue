<template>
	<div class="flex flex-col gap-4">
		<h2 class="text-2xl font-semibold text-ls-900 dark:text-ds-200">Welcome to Polaris!</h2>
		<p class="mb-4 text-ls-500 dark:text-ds-400">Your server is up and running, let's configure a couple things.</p>
		<Button data-cy="submit-welcome" label="Sounds good!" size="xl" @click="emits('proceed')" />
	</div>
</template>

<script setup lang="ts">
import Button from "@/components/basic/Button.vue";

const emits = defineEmits<{
	"proceed": [],
}>();

</script>
