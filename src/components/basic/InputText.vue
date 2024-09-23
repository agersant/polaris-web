<template>
    <div>
        <label v-if="label" :for="name" class="block text-sm font-medium leading-6 text-ls-900 dark:text-ds-0">
            {{ props.label }}
        </label>
        <div :class="{ 'mt-2': label }" class="relative rounded-md shadow-sm">
            <div v-if="icon" class="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <span class="material-icons-round text-ls-400" v-text="icon" />
            </div>
            <input ref="input" v-focus="autofocus" v-model="model" :id="id" :type="password ? 'password' : 'text'"
                :placeholder="placeholder" :name="name" :autocomplete="autocomplete" :autofocus="autofocus"
                :required="required" :class="inputClass" class="w-full rounded-md border-0 py-2 pr-8 shadow-sm text-sm leading-6
                ring-1 ring-inset focus:ring-2 focus:ring-inset 
                dark:bg-white/5
                text-ls-900 dark:text-ds-0
                placeholder:text-ls-400 dark:placeholder:text-ls-400 
                ring-ls-300 dark:ring-white/10 focus:ring-accent-600 dark:focus:ring-accent-600" />
            <div v-if="clearable && model" @click="clear"
                class="absolute cursor-pointer inset-y-0 right-2 flex items-center text-ls-400 hover:text-ls-700 dark:text-ds-400 dark:hover:text-ds-200">
                <span class="material-icons-round" v-text="'close'" />
            </div>
            <div v-if="error" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="material-icons-round text-red-500">error</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';

const input = useTemplateRef("input");

const vFocus = {
    mounted: (el: HTMLElement, binding: { value: any }) => {
        if (binding.value) {
            el.focus();
        }
    }
};

const props = defineProps<{
    id: string,
    label?: string,
    icon?: string,
    placeholder?: string,
    name?: string,
    autocomplete?: string,
    autofocus?: boolean,
    password?: boolean,
    required?: boolean,
    clearable?: boolean,
    error?: boolean,
}>();

const model = defineModel<string>({ required: true });

function clear() {
    model.value = "";
    input.value?.focus();
}

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
