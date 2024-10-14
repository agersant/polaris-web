<template>
	<Step title="Welcome to Polaris!" description="Your server is up and running, let's configure a couple things.">
		<Button label="Sounds good!" size="xl" @click="emits('proceed')" />
	</Step>
</template>

<script setup lang="ts">
import Button from "@/components/basic/Button.vue";
import Step from "@/components/initial-setup/Step.vue";

const emits = defineEmits<{
	"proceed": [],
}>();
</script>
