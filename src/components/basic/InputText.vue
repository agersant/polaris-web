<template>
    <div>
        <label v-if="label" :for="props.name"
            class="block text-sm font-medium leading-6 text-gray-900 dark:text-white">{{
                props.label }}</label>
        <div class="relative mt-2 rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span v-if="icon" class="material-icons-round text-gray-400">{{ props.icon }}</span>
            </div>
            <input v-model="model" :id="props.id" :placeholder="props.placeholder" :name="props.name"
                :autocomplete="props.autocomplete" :autofocus="props.autofocus" :required="props.required"
                :class="inputClass" class="w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset text-sm leading-6
                dark:bg-white/5 text-gray-900 dark:text-white
                placeholder:text-gray-400 
                ring-gray-300 dark:ring-white/10 focus:ring-accent-600 dark:focus:ring-accent-500" />
            <div v-if="error" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="material-icons-round text-red-500">error</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, defineModel } from 'vue';

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
        ...(props.error ? [
            "text-red-900", "dark:text-red-100",
            "ring-red-300", "dark:ring-red-700",
            "placeholder:text-red-300", "dark:placeholder:text-red-300",
            "focus:ring-red-500", "dark:focus:ring-red-500"]
            : []),
        ...(props.icon ? ["pl-10"] : [])
    ];
});
</script>
