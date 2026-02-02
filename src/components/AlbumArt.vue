<template>
    <UseImage :src="url || ''" data-pw="album-art" class="w-full h-full object-cover" :class="rounding">
        <template #loading>
            <div class="bg-ls-200 text-ls-400 dark:bg-ds-950/30 dark:text-ds-600 w-full h-full aspect-square flex items-center justify-center"
                :class="rounding">
                <Spinner />
            </div>
        </template>

        <template #error>
            <div data-pw="album-art"
                class="bg-ls-200 dark:bg-ds-950/30 w-full h-full aspect-square flex items-center justify-center"
                :class="rounding">
                <span class="material-icons-round text-ls-400 dark:text-ds-700">image_not_supported</span>
            </div>
        </template>
    </UseImage>
</template>

<script setup lang="ts">
import { UseImage } from "@vueuse/components";

import Spinner from "@/components/basic/Spinner.vue"

const { rounding = "rounded-md", ...props } = defineProps<{
    url: string | undefined,
    rounding?: string,
}>();
</script>
