<template>
	<div @contextmenu="show">
		<slot />
		<FloatingWidget ref="el" :position="position" @dismissed="open = false">
			<div v-if="open" class="flex flex-col min-w-40 p-2 text-sm 
				rounded-md bg-ls-0 dark:bg-ds-900
				border border-ls-200 dark:border-ds-700
				shadow-lg shadow-accent-800/20 dark:shadow-accent-900/20">
				<div v-for="item in items"
					class="group cursor-pointer flex justify-between gap-12 px-3 py-1.5 rounded-sm hover:bg-accent-100 dark:hover:bg-accent-900"
					@click="execute(item)">
					<div v-text="item.label"
						class="font-medium text-ls-700 dark:text-ds-300 group-hover:text-accent-700 dark:group-hover:text-accent-200" />
					<div v-if="item.shortcut" v-text="item.shortcut"
						class="text-ls-400 dark:text-ds-600 group-hover:text-accent-400 dark:group-hover:text-accent-400" />
				</div>
			</div>
		</FloatingWidget>
	</div>
</template>

<script setup lang="ts">
import { Ref, ref, useTemplateRef } from "vue";
import FloatingWidget from "@/components/basic/FloatingWidget.vue";

export type ContextMenuItem = {
	label: string,
	shortcut?: string,
	action: () => void,
};

defineProps<{
	items: ContextMenuItem[],
}>();

const open = ref(false);

const el = useTemplateRef("el");
const position: Ref<[number, number]> = ref([0, 0] as [number, number]);

defineExpose({ show });

function show(event: MouseEvent) {
	open.value = true;
	el.value?.open();
	position.value = [event.clientX, event.clientY];
}

function execute(item: ContextMenuItem) {
	item.action();
	el.value?.close();
}
</script>
