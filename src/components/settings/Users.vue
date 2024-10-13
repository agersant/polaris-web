<template>
	<div class="flex flex-col min-h-0">

		<div class="flex flex-col gap-8 grow overflow-y-scroll -mx-4 px-4">
			<div v-for="user in users.listing" :key="user.name"
				class=" rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">
				<User :user="user" />
			</div>

			<Button v-if="!newUser" label="Add User" icon="person_add" severity="secondary" size="xl" class="self-start"
				@click="beginCreateUser" />

			<div v-else
				class="flex flex-col gap-8 rounded-md p-8 border bg-ls-0 border-ls-200 dark:bg-ds-900 dark:border-ds-700">

				<div class="flex gap-4 items-center">
					<span class="material-icons-round
                        rounded-full p-2
                        flex items-center justify-center
                        text-ls-500 dark:text-ds-400
                        bg-ls-200 dark:bg-ds-700" v-text="'face'" />
					<div v-text="newUser.name || 'New User'" class="font-medium text-ls-600 dark:text-ds-300" />
				</div>

				<InputText v-model="newUser.name" id="username" label="Username" icon="face" autofocus class="w-80"
					:error="!validNewUserName && !!newUser.name.length" />
				<InputText v-model="newUser.password" id="password" label="Password" icon="key" password class="w-80" />
				<Button label="Create User" icon="person_add" severity="primary" size="xl" @click="endCreateUser"
					:disabled="!validNewUser" class="self-end" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, computed } from "vue";

import { NewUser } from "@/api/dto";
import Button from "@/components/basic/Button.vue";
import InputText from "@/components/basic/InputText.vue";
import User from "@/components/settings/User.vue";
import { useUsersStore } from "@/stores/users";

const users = useUsersStore();

onMounted(() => {
	users.refresh();
});

const newUser: Ref<NewUser | undefined> = ref(undefined);

const validNewUserName = computed(() => {
	if (!newUser.value) {
		return false;
	}
	const newUsername = newUser.value.name;
	return newUsername.length && !users.listing?.some(u => u.name == newUsername);
});

const validNewUserPassword = computed(() => {
	if (!newUser.value) {
		return false;
	}
	return newUser.value.password.length;
});

const validNewUser = computed(() => validNewUserName.value && validNewUserPassword.value);

function beginCreateUser() {
	newUser.value = {
		name: "",
		password: "",
		admin: false,
	};
}

async function endCreateUser() {
	if (newUser.value) {
		await users.create(newUser.value);
	}
	newUser.value = undefined;
}

</script>
