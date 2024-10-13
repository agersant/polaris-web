<template>
	<div class="flex flex-col">
		<div class="grow flex flex-col justify-center text-center">
			<BlankStateFiller icon="error_outline">
				This page does not exist.
			</BlankStateFiller>
		</div>
	</div>
</template>

<script setup lang="ts">
import BlankStateFiller from '@/components/basic/BlankStateFiller.vue';
</script>
