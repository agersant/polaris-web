<template>
    <div class="flex items-start justify-center">
        <div class="rounded-md w-full bg-red-50 dark:bg-red-900 p-4">
            <div class="flex items-center">
                <span class="material-icons-round text-red-400 dark:text-red-400 mt-0.5">
                    error_outline
                </span>
                <div class="ml-3">
                    <p class="text-sm font-medium text-red-800 dark:text-red-200">
                        <slot />
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
