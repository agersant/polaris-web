<template>
    <Listbox as="div" v-model="selected" :data-pw="testID">
        <ListboxLabel v-if="label" class="block mb-2 text-sm font-medium leading-6 text-ls-900 dark:text-ds-0">
            {{ label }}
        </ListboxLabel>

        <div class="relative">

            <ListboxButton
                class="relative w-full cursor-default rounded-md bg-ls-0 dark:bg-white/5 py-2 pl-3 pr-10 text-left text-ls-900 dark:text-ds-0 shadow-sm ring-1 ring-inset ring-ls-300 dark:ring-white/10 focus:outline-none focus:ring-2 focus:ring-accent-600 sm:text-sm sm:leading-6">
                <span v-text="selected?.label" class="block truncate" />
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <span class="material-icons-round text-ls-400 dark:text-ds-600">arrow_drop_down</span>
                </span>
            </ListboxButton>

            <transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
                leave-to-class="opacity-0">
                <ListboxOptions
                    class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-ls-0 dark:bg-ds-950 py-1 text-base shadow-lg ring-1 ring-black/5 dark:ring-white/5 focus:outline-none sm:text-sm">
                    <ListboxOption as="template" v-for="option, index in options" :key="option.key || index"
                        :value="option" v-slot="{ active, selected }">
                        <li
                            :class="[active ? 'bg-accent-600 text-ls-0 dark:bg-ds-800' : 'text-ls-900 dark:text-ds-0', 'relative cursor-default py-2 pl-3 pr-9']">
                            <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                                {{ option.label }}
                            </span>
                            <span v-if="selected"
                                :class="[active ? 'text-ls-0 dark:text-ds-0' : 'text-accent-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
                                <span class="material-icons-round">check</span>
                            </span>
                        </li>
                    </ListboxOption>
                </ListboxOptions>
            </transition>

        </div>
    </Listbox>
</template>

<script setup lang="ts" generic="T extends string | number | boolean | object">
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions } from '@headlessui/vue'

export interface SelectOption<T> {
    label: string,
    key?: string | number | symbol,
    value: T,
}

const selected = defineModel<SelectOption<T>>({ required: true });

defineProps<{
    label?: string,
    options: SelectOption<T>[],
    testID?: string,
}>();
</script>
