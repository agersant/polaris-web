<template>
    <div>
        <label v-if="label" :for="props.name" class="block text-sm font-medium leading-6 text-ls-900 dark:text-ds-0">
            {{ props.label }}
        </label>
        <div :class="{ 'mt-2': label }" class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span v-if="icon" class="material-icons-round text-ls-400">
                    {{ props.icon }}
                </span>
            </div>
            <input v-model="model" :id="props.id" :placeholder="props.placeholder" :name="props.name"
                :autocomplete="props.autocomplete" :autofocus="props.autofocus" :required="props.required"
                :class="inputClass" class="w-full rounded-md border-0 py-2 shadow-sm text-sm leading-6
                ring-1 ring-inset focus:ring-2 focus:ring-inset 
                dark:bg-white/5
                text-ls-900 dark:text-ds-0
                placeholder:text-ls-400 dark:placeholder:text-ls-400 
                ring-ls-300 dark:ring-white/10 focus:ring-accent-600 dark:focus:ring-accent-600" />
            <div v-if="error" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="material-icons-round text-red-500">error</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    id: string,
    label?: string,
    icon?: string,
    placeholder?: string,
    name?: string,
    autocomplete?: string,
    autofocus?: boolean,
    required?: boolean,
    error?: boolean,
}>();

const model = defineModel<string>({ required: true });

const inputClass = computed(() => {
    return [
        props.error ?
            `text-red-600 dark:text-red-100
            ring-red-200 dark:ring-red-700
            placeholder:text-red-300 dark:placeholder:text-red-300
            focus:ring-red-500 dark:focus:ring-red-500`
            : "",
        props.icon ? "pl-10" : ""
    ];
});
</script>
