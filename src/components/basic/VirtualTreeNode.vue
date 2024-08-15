<template>
    <div class="flex items-center text-muted-color" :style="computedStyle">
        <button v-if="!node.leaf" type="button" @click="toggle" class="mr-2 mt-1">
            <template v-if="node.loading">
                <SpinnerIcon spin />
            </template>
            <template v-else>
                <ChevronDownIcon v-if="expanded" />
                <ChevronRightIcon v-else />
            </template>
        </button>
        <slot name="icon" />
        <span class="text-color">{{ props.node.label }}</span>
    </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@primevue/icons/chevrondown';
import ChevronRightIcon from '@primevue/icons/chevronright';
import SpinnerIcon from '@primevue/icons/spinner';
import { computed, StyleValue } from 'vue';

import { Node } from "@/components/basic/VirtualTree.vue";

const props = defineProps<{
    node: Node,
    expanded: boolean,
}>();

const emit = defineEmits<{
    (e: 'node-toggle', node: Node): void,
}>();

function toggle() {
    emit('node-toggle', props.node);
}

const computedStyle = computed((): StyleValue => {
    return { "margin-left": `${12 * props.node.depth}px` }
});

</script>