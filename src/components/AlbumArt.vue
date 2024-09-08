<template>
    <UseImage :src="url || ''" class="w-full h-full object-cover rounded-md">
        <template #loading>
            <div
                class="bg-ls-200 text-ls-400 dark:bg-ds-800 dark:text-ds-600 rounded-md w-full h-full flex items-center justify-center">
                <Spinner />
            </div>
        </template>

        <template #error>
            <div class="bg-ls-200 dark:bg-ds-800 rounded-md w-full h-full flex items-center justify-center">
                <span class="material-icons-round text-ls-400 dark:text-ds-700">image_not_supported</span>
            </div>
        </template>
    </UseImage>
</template>

<script setup lang="ts">
import { UseImage } from "@vueuse/components";

import Spinner from "@/components/basic/Spinner.vue"

defineProps<{
    url: string | undefined,
}>();
</script>
