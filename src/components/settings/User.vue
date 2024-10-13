<template>
    <div class="flex justify-between items-center">
        <div class="flex flex-col gap-4">
            <SectionTitle :label="user.name" class="!mb-0">
                <template #left>
                    <span class="material-icons-round rounded-full p-1
										flex items-center justify-center
										text-ls-500 dark:text-ds-400
										bg-ls-200 dark:bg-ds-700" v-text="'person'" />
                </template>
            </SectionTitle>
            <div v-if="!isSelf" class="flex flex-col gap-2">
                <Toggle v-model="isAdmin" label="Administrator" />
                <span class="italic text-xs text-ls-500 dark:text-ds-400">Grants access to all settings.</span>
            </div>
            <div v-if="editingPassword" class="flex items-end gap-4">
                <InputText v-model="newPassword" id="new-password" label="New Password" icon="key" password />
                <Button label="Apply" icon="check" size="lg" :disabled="!newPassword.length"
                    @click="confirmPasswordChange" />
            </div>
        </div>
        <div class="flex gap-2 justify-end">
            <Button v-if="!editingPassword" label="Change Password" icon="key" severity="tertiary" size="sm"
                @click="editingPassword = true" />
            <Button label="Delete User" icon="delete" severity="tertiary" size="sm" @click="users.deleteUser(user.name)"
                :disabled="isSelf" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { User } from '@/api/dto';
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import SectionTitle from "@/components/basic/SectionTitle.vue";
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
