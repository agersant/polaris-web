<template>
    <div>
        <button v-if="!node.leaf" type="button" @click="toggle" tabindex="-1" aria-hidden="true">
            <template v-if="node.loading">
                <SpinnerIcon spin />
            </template>
            <template v-else>
                <ChevronDownIcon v-if="expanded" />
                <ChevronRightIcon v-else />
            </template>
        </button>
        <span>{{ props.node.label }}</span>
    </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@primevue/icons/chevrondown';
import ChevronRightIcon from '@primevue/icons/chevronright';
import SpinnerIcon from '@primevue/icons/spinner';

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

</script>