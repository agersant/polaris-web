<template>
    <div class="flex flex-col gap-8">

        <div class="flex items-center justify-between -my-8 -mx-4 mb-0 py-6 px-4 border-b border-ls-200">
            <div class="flex gap-4 items-center">
                <span class="material-icons-round
                        rounded-full p-2
                        flex items-center justify-center
                        text-ls-500 dark:text-ds-400
                        bg-ls-200 dark:bg-ds-700" v-text="'face'" />
                <div v-text="user.name" class="font-medium text-ls-500 dark:text-ds-400" />
            </div>
            <div class="flex gap-4 justify-end">
                <Button v-if="!editingPassword" label="Change Password" icon="key" severity="secondary" size="base"
                    @click="editingPassword = true" />
                <Button label="Delete User" icon="delete" severity="danger" size="base"
                    @click="users.deleteUser(user.name)" :disabled="isSelf" />
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <Toggle v-model="isAdmin" label="Administrator" />
            <span class="italic text-xs text-ls-500 dark:text-ds-400">Grants access to all settings.</span>
        </div>

        <div v-if="editingPassword" class="flex items-end gap-4">
            <InputText v-model="newPassword" id="new-password" label="New Password" icon="key" password />
            <Button label="Apply" icon="check" size="lg" :disabled="!newPassword.length"
                @click="confirmPasswordChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { User } from '@/api/dto';
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
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

async function confirmPasswordChange() {
    await users.update(props.user.name, {
        new_password: newPassword.value,
    });
    editingPassword.value = false;
    newPassword.value = "";
}
</script>
