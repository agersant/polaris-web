<template>
    <div class="flex flex-col gap-8">

        <div class="flex items-center justify-between">
            <div class="flex gap-4 items-center">
                <span class="material-icons-round
                        rounded-full p-2
                        flex items-center justify-center
                        text-ls-500 dark:text-ds-400
                        bg-ls-200 dark:bg-ds-700" v-text="'face'" />
                <div v-text="user.name" class="font-medium text-ls-600 dark:text-ds-300" />
            </div>

            <div class="relative flex gap-4 justify-end">
                <Button label="Change Password" icon="key" severity="secondary" size="base"
                    @click="editingPassword = true" />
                <Button label="Delete User" icon="delete" severity="danger" size="base"
                    @click="users.deleteUser(user.name)" :disabled="isSelf" />

                <ScreenFade>
                    <ScreenDarkening v-if="editingPassword" class="z-10" />
                </ScreenFade>

                <Transition appear name="slide">
                    <div v-if="editingPassword" v-on-click-outside="cancelPasswordChange" class="z-10 absolute right-0 -bottom-2 w-80 translate-y-full
							rounded-md
							bg-ls-0 dark:bg-ds-950
							shadow-lg shadow-accent-600/20	
							dark:shadow-none dark:border dark:border-ds-800
							">
                        <div class="relative p-6 flex flex-col gap-4">
                            <InputText v-model="newPassword" id="new-password" label="New Password" icon="key" autofocus
                                password />
                            <Button label="Apply" icon="check" size="lg" :disabled="!newPassword.length"
                                @click="confirmPasswordChange" />
                            <div class="absolute right-2 top-2">
                                <Button icon="close" severity="tertiary" @click="cancelPasswordChange" />
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <Toggle v-model="isAdmin" label="Administrator" :disabled="isSelf" />
            <span class="italic text-xs text-ls-500 dark:text-ds-400">Grants access to all settings.</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { vOnClickOutside } from '@vueuse/components'

import { User } from '@/api/dto';
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import ScreenDarkening from "@/components/basic/ScreenDarkening.vue";
import ScreenFade from "@/components/basic/ScreenFade.vue";
import Toggle from "@/components/basic/Toggle.vue";
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';

const currentUser = useUserStore();
const users = useUsersStore();

const props = defineProps<{
    user: User,
}>();

const isSelf = computed(() => props.user.name == currentUser.name);

const isAdmin = computed({
    get: () => props.user.is_admin,
    set: (value) => users.update(props.user.name, { new_is_admin: value }),
});

const newPassword = ref("");
const editingPassword = ref(false);

function cancelPasswordChange() {
    editingPassword.value = false;
    newPassword.value = "";
}

async function confirmPasswordChange() {
    await users.update(props.user.name, {
        new_password: newPassword.value,
    });
    editingPassword.value = false;
    newPassword.value = "";
}
</script>


<style lang="css" scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
    translate: 0 -20px;
    opacity: 0;
}
</style>